import Resolver from '@forge/resolver';
import api, { route } from "@forge/api";
import { ItemsStorage } from './items-storage';

const resolver = new Resolver();
const maxBusyHours = 99;

resolver.define('getText', async (req) => {
  console.log('getText', req);
  var reqData = req.payload || {};
  var context = req.context;
  var pageId = context.extension?.content?.id;
  var userId = context.accountId
  var value = reqData.example || 'none';
  var userData = await getCurrentUserData();
  const config = getConfigFromRequest(req);
  return `result: ${value}, pageId: ${pageId}, userId: ${userId}, ${userData.displayName}, Config: ${JSON.stringify(config)}`;
});

// Handlers for front-end API commands

resolver.define('getAllEnv', async (req) => {
  const config = getConfigFromRequest(req);
  const itemNames = ItemsStorage.getConfigItemNames(config);
  const environments = await ItemsStorage.getUpdatedItemsList(itemNames);
  return { environments };
});

resolver.define('useEnv', async (req) => {
  console.log('useEnv', req.payload);
  const { envName, data } = req.payload;
  const userData = await getCurrentUserData();
  const config = getConfigFromRequest(req);
  const itemNames = ItemsStorage.getConfigItemNames(config);
  if (!itemNames.includes(envName)) {
    return errorItemNotFound();
  }

  var item = await ItemsStorage.getItemByNameOrCreate(envName);
  if (item.used) {
    return errorResponse('Environment already used', 'item_already_used');
  }

  const hoursRaw = Number.parseFloat(data.hours);
	const comment = data.comment;

  if (isEmptyString(comment)) {
    return errorResponse('Comment is empty', 'comment_is_empty');
  }
  if (Number.isNaN(hoursRaw) || hoursRaw < 0.01) {
    return errorResponse("Wrong time format", 'wrong_time_format');
  }
  
  const hours = Math.min(maxBusyHours, hoursRaw);
  item.used = true;
  item.userName = userData.displayName;
  item.usedFrom = new Date().toISOString();
  item.usedTo = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  item.comment = limitString(comment, 200);
  ItemsStorage.addHistoryItem(item, ItemsStorage.createHistoryItem(userData, "Using for "+hours.toFixed(1)+" hours. "+comment))
  await ItemsStorage.saveItem(item);
  const environments = await ItemsStorage.getUpdatedItemsList(itemNames);
  return { environments };
});

resolver.define('setBusyTime', async (req) => {
  console.log('setBusyTime', req.payload);
  const { envName, hours } = req.payload;

  const userData = await getCurrentUserData();
  const config = getConfigFromRequest(req);
  const itemNames = ItemsStorage.getConfigItemNames(config);
  if (!itemNames.includes(envName)) {
    return errorItemNotFound();
  }

  var item = await ItemsStorage.getItemByNameOrCreate(envName);
  if (!item.used) {
    return errorItemNotUsed();
  }

  // process hours value
  var hoursChanged = Number.parseFloat(hours);
  if (Number.isNaN(hoursChanged) || hoursChanged < 0.01) {
      return errorResponse("Wrong time format", 'wrong_time_format');
  }
  hoursChanged = Math.min(maxBusyHours, hoursChanged);

  item.usedTo = new Date(Date.now() + hoursChanged * 60 * 60 * 1000).toISOString();
  ItemsStorage.addHistoryItem(item, ItemsStorage.createHistoryItem(userData, "Changed busy time: "+hoursChanged.toFixed(1)))
  await ItemsStorage.saveItem(item);

  const environments = await ItemsStorage.getUpdatedItemsList(itemNames);
  return { environments };
});

resolver.define('freeEnv', async (req) => {
  console.log('freeEnv', req.payload);
  const { envName } = req.payload;
  const userData = await getCurrentUserData();
  const config = getConfigFromRequest(req);
  const itemNames = ItemsStorage.getConfigItemNames(config);
  if (!itemNames.includes(envName)) {
    return errorItemNotFound();
  }

  var item = await ItemsStorage.getItemByNameOrCreate(envName);
  if (item.used) {
    item.used = false;
    item.usedFrom = '';
    item.usedTo = '';
    item.userName = '';
    item.comment = '';
    ItemsStorage.addHistoryItem(item, ItemsStorage.createHistoryItem(userData, "Free"));
    await ItemsStorage.saveItem(item);
  }

  const environments = await ItemsStorage.getUpdatedItemsList(itemNames);
  return { environments };
});


/*
item example:
{
  "index": 1,
  "name": "QA1",
  "used": true,
  "usedFrom": "2024-01-09T08:38:18.810Z",
  "usedTo": "2024-01-09T20:38:18.810Z",
  "userName": "Alex",
  "comment": "Task #123",
  "history": [
    {
      "date": "2024-01-09T08:38:18.810Z",
      "userName": "Alex",
      "comment": "Using, Task #123",
    }
  ]
}
*/

async function getCurrentUserData() {
  return (await api.asUser().requestConfluence(route`/rest/api/user/current`)).json();
}

function getConfigFromRequest(req) {
  return req.context?.extension?.config || {};
}

function errorResponse(message, errorCode) {
  return { error: message, errorCode: errorCode || 'unknown' };
}

function errorItemNotUsed() {
  return errorResponse("Item is not used", 'item_not_used');
}

function errorItemNotFound() {
  return errorResponse("Item not found by name", "item_not_found");
}

function isEmptyString(value) {
  return typeof value != 'string' || value.length == 0;
} 

function limitString(string, maxLength) {
  return typeof string != "string" ? null : string.length <= maxLength ? string : string.substring(0, maxLength);
}

export const handler = resolver.getDefinitions();