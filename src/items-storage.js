import { storage, startsWith } from "@forge/api";

const storagePrefixItems = "items__"
const maxHistoryCount = 10;

export const ItemsStorage = {
    saveItem: async function(item) {
        const name = item.name;
        if (name == null || name.length == 0) {
            throw Error("Item name is empty");
        }
        const valueKey = `${storagePrefixItems}${name}`;
        const filteredItem = {
            name: item.name,
            used: item.used,
            usedFrom: item.usedFrom,
            usedTo: item.usedTo,
            userName: item.userName,
            comment: item.comment,
            history: item.history || []
        };
        await storage.set(valueKey, filteredItem);
    },
    
    deleteItem: async function(name) {
        const valueKey = `${storagePrefixItems}${name}`;
        await storage.delete(valueKey);
    },
    
    getAllItemsMap: async function() {
        const queryResult = await storage
            .query()
            .where('key', startsWith(storagePrefixItems))
            .getMany();
        //console.log(queryResult);
        const results = queryResult.results || [];
        const itemsMap = {};
        results.forEach((result) => {
            const data = result.value;
            const name = data.name;
            if (name && name.length > 0) {
                itemsMap[name] = data;
            }
        });
        
        return itemsMap;
    },

    getItemByNameOrCreate: async function(name) {
        const itemsMap = await this.getAllItemsMap();
        const item = itemsMap[name];
        if (item == null) {
            return this.createEmptyItem(name);
        }
        return item;
    },
    
    getAllItemsList: async function() {
        const itemsMap = await this.getAllItemsMap();
        const items = Object.keys(itemsMap).map((key) => itemsMap[key]);
        items.sort((a, b) => {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();
            if (nameA < nameB) {
                return -1;
            } else if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
        return items;
    },

    getConfigItemNames: function(config) {
        const cfg = config || {};
        const rawNames = cfg.itemNames || '';
        const result = rawNames.split(';')
            .map(name => name.trim())
            .filter(name => name !== '');
        return result;
    },

    getUpdatedItemsList: async function(itemNames) {
        const existingItemsMap = await this.getAllItemsMap();
        const existingItemsKeys = Object.keys(existingItemsMap);
    
        // find items to delete
        const itemsToDelete = existingItemsKeys.filter((key) => !itemNames.includes(key));
        await Promise.all(itemsToDelete.map((key) => this.deleteItem(key)));
    
        // find items to create
        const itemsToCreate = itemNames.filter((name) => !existingItemsKeys.includes(name));
        for (var name of itemsToCreate) {
            const newItem = this.createEmptyItem(name);
            await this.saveItem(newItem);
        }
    
        // get all items and sort
        const updatedItemsMap = await this.getAllItemsMap();
        const updatedItems = itemNames.map((name) => updatedItemsMap[name]);

        // free environments if time expired
        for (var item of updatedItems) {
            var timeLeft = (new Date(item.usedTo) - Date.now());
            if (timeLeft < 0 || Number.isNaN(timeLeft)) {
                item.used = false;
                item.usedFrom = '';
                item.usedTo = '';
                item.userName = '';
                item.comment = '';
                await this.saveItem(item);
            }
        }

        return updatedItems;
      },

      createEmptyItem: function(name) {
        return {
            name: name,
            used: false,
            usedFrom: '',
            usedTo: '',
            userName: '',
            comment: '',
            history: [],
          };
      },

      addHistoryItem: function (item, historyItem) {
        var history = item.history || [];
        history.push(historyItem);
    
        // remove old history items
        history.sort((a, b) => { 
            return new Date(b.date) - new Date(a.date);
        });
        if (history.length > maxHistoryCount) {
            history = history.slice(0, maxHistoryCount - 1);
        }
        item.history = history;
    },

    createHistoryItem: function(userData, comment) {
        return {
            date: (new Date()).toISOString(),
            userName: userData.displayName,
            userId: userData.accountId,
            comment: comment
        };
    }
};

