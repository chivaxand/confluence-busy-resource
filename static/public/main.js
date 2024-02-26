(function initOnLoad(onLoadFunc) {
	if (window.addEventListener){ window.addEventListener("load", onLoadFunc, false); } 
	else if (window.attachEvent) { window.attachEvent("onload", onLoadFunc); } 
	else { document.addEventListener("load", onLoadFunc, false);}
})(function (e) {
	// add listeners to buttons instead of using "onclick" attribute and fix input[type='text']
	const inputElements = document.querySelectorAll('input');
	inputElements.forEach((input) => {
		if (input.getAttribute("type") == null) {
			input.setAttribute("type", "text");
		} else if (input.type === 'button') {
			const functionName = input.getAttribute('data-onclick');
			if (functionName == null || functionName == '') {
				return;
			}
			if (typeof window[functionName] !== 'function') {
				console.error(`Function ${functionName} is not defined or not a function`);
				return;
			}
			input.addEventListener('click', window[functionName]);
		}
	});

	initEnvManager();
});

var app = {
	manager: undefined
}
window.app = window.app || app;

function initEnvManager() {
	var manager = new EnvironmentManager();
	app.manager = manager;
	manager.onEnvUpdate = function() {
		updateEnvTable();
	}

	// app.invoke('getText', { example: 'test-data' }).then((e) => { console.log(e); });

	LoaderAnimation.start();
	manager.getAllEnvironments(function(success) {
		LoaderAnimation.stop();
	});
}

function updateEnvTable() {
	const envTable = document.getElementById('envTable');
	const environments = app.manager.environments;
	const tbody = envTable.querySelector('tbody');
	tbody.innerHTML = '';
	
	for (const envName in environments) {
		const env = environments[envName];
		const row = document.createElement('tr');
		if (env.used) {
			row.classList.add('used');
		}

		row.addEventListener('click', function() {
			const allRows = envTable.querySelectorAll('tr');
			allRows.forEach(row => row.classList.remove('selected'));
			this.classList.add('selected');
			onEnvRowSelected(row);
		});
		
		const envCell = document.createElement('td');
		envCell.textContent = envName;
		envCell.classList.add('center');
		row.appendChild(envCell);

		const usedCell = document.createElement('td');
		usedCell.textContent = env.used ? 'Used' : 'Free';
		usedCell.classList.add('center');
		row.appendChild(usedCell);
		
		const userCell = document.createElement('td');
		userCell.textContent = env.userName || '';
		userCell.classList.add('center');
		row.appendChild(userCell);
		
		const usedFromDateCell = document.createElement('td');
		usedFromDateCell.textContent = env.usedFrom ? formatDate(new Date(env.usedFrom)) : '';
		usedFromDateCell.classList.add('center');
		row.appendChild(usedFromDateCell);
		
		const busyUntilCell = document.createElement('td');
		busyUntilCell.classList.add('center');
		busyUntilCell.textContent = '';
		if (env.usedTo) {
			const usedTo = new Date(env.usedTo);
			const hoursLeft = Math.max(((usedTo - Date.now()) / (1000 * 60 * 60)), 0).toFixed(1);
			busyUntilCell.textContent = hoursLeft + " hours";
		}
		row.appendChild(busyUntilCell);
		
		const commentCell = document.createElement('td');
		commentCell.textContent = env.comment || '';
		row.appendChild(commentCell);
		
		tbody.appendChild(row);
	}

	onEnvRowSelected(null);
}

function updateHistoryTable(history) {
	const historyTable = document.getElementById('historyTable');
	const tbody = historyTable.querySelector('tbody');
	tbody.innerHTML = '';
	
	for (const item of history) {
		const row = document.createElement('tr');
		
		const dateCell = document.createElement('td');
		dateCell.textContent = item.date ? formatDate(new Date(item.date)) : '';
		row.appendChild(dateCell);
		
		const userCell = document.createElement('td');
		userCell.textContent = item.userName || '';
		row.appendChild(userCell);
		
		const commentCell = document.createElement('td');
		commentCell.textContent = '';
		commentCell.textContent = item.comment || '';
		row.appendChild(commentCell);
		
		tbody.appendChild(row);
	}
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    return year+'-'+month+'-'+day+' '+hours+':'+minutes;
}

function onEnvRowSelected(row) {
	var envInfo = document.getElementById("envInfo");
	var useEnvView = document.getElementById("use-env-cnt");
	var changeEnvView = document.getElementById("change-env-cnt");
	var env = getSelectedEnv();
	if (!env) {
		envInfo.style.display = 'none';
		return;
	}
	console.log("Selected:", env.name);

	envInfo.style.display = 'block';
	useEnvView.style.display = env.used ? 'none' : 'block';
	changeEnvView.style.display = env.used ? 'block' : 'none';

	var selectedEnvTitle = document.getElementById('selectedEnvTitle');
	selectedEnvTitle.innerText = env.name;

	updateHistoryTable(env.history);
}

function getSelectedEnv() {
	const envTable = document.getElementById('envTable');
	const selectedRow = envTable.querySelector('tr.selected');
	if (!selectedRow) {
		return null;
	}

	var envName = selectedRow.cells[0].textContent ;
	var manager = app.manager;
	if (!envName || envName.length == 0) {
		return null;
	}

	var env = manager.environments[envName];
	if (!env) {
		console.error("Environment not found:", envName);
		return null;
	}
	return env;
}

function useSelectedEnv() {
	var env = getSelectedEnv();
	if (!env) {
		return;
	}

	console.log("Use evironment:", env.name);
	var hoursElem = document.querySelector('#use-env-cnt input[name="hours"]');
	var commentElem = document.querySelector('#use-env-cnt input[name="comment"]');
	var hoursStr = hoursElem.value;
	var comment = commentElem.value.trim();
	var hours = parseAndCheckHoursValue(hoursStr);
	if (!hours) {
		return;
	}
	if (!comment || comment.length == 0) {
		alert("Comment is empty");
		return;
	}

	var data = {
		hours: hours,
		comment: comment
	}

	LoaderAnimation.start();
	app.manager.useEnvironment(env.name, data, function(success) {
		LoaderAnimation.stop();
		if (success) {
			hoursElem.value = '12';
			commentElem.value = '';
		}
	});
}

function changeTimeForSelectedEnv() {
	var env = getSelectedEnv();
	if (!env) {
		return;
	}
	console.log("Set evironment busy time", env.name);
	if (!env.used) {
		alert("Environment not used");
		return;
	}
	var hoursStr = prompt("Enter busy time in hours starting from current time:", 12);
	var hours = parseAndCheckHoursValue(hoursStr);
	if (!hours) {
		return;
	}

	LoaderAnimation.start();
	app.manager.setBusyTime(env.name, hours, function() {
		LoaderAnimation.stop();
	});
}

function parseAndCheckHoursValue(hours) {
	if (!hours || hours.length == 0) {
		return null;
	}
	hours = Number.parseFloat(hours);
	if (Number.isNaN(hours) || hours < 0.01) {
		alert("Wrong number format");
		return null;
	}
	if (hours > 100) {
		alert("Number is too large");
		return null;
	}
	return hours;
}

function makeSelectedEnvFree() {
	var env = getSelectedEnv();
	if (!env) {
		return;
	}
	var envName = env.name;
	console.log("Free evironment:", envName);
	if (!env.used) {
		alert("Environment not used");
		return;
	}
	if (!window.confirm("Do you want to free environment '"+envName+"' ?")) {
		return;
	}

	LoaderAnimation.start();
	app.manager.makeEnvFree(envName, function() {
		LoaderAnimation.stop();
	});
}
