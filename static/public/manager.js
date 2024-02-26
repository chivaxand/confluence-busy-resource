
class EnvironmentManager {
	onEnvUpdate = undefined;
    api = undefined;
    
	constructor() {
		this.environments = {};
        this.api = new ServerApi();
	}

	_updateEnironmentsFromJson(json) {
        if (json && json.environments) {
            this._updateEnvironments(json.environments);
        } else { // first init
            this._updateEnvironments();
        }
        this._notifyEnvUpdated();
	}

	_notifyEnvUpdated() {
		if (this.onEnvUpdate) {
			this.onEnvUpdate(this);
		}
	}

	_updateEnvironments(environments) {
		environments = environments || [];
		var result = {};
		for (var env of environments) {
			var name = env.name;
			if (name && name.length > 0) {
				if (env.used != true) {
					env.userName = "";
					env.usedFrom = "";
					env.usedTo = "";
					env.comment = "";
				}
				result[name] = env;
			}
		}
		this.environments = result;
	}

	getAllEnvironments(callback) {
        var self = this;
        this.api.getAllEnvironments(function(json) {
			if (json.error) { alert(json.error); }
			else { self._updateEnironmentsFromJson(json); }
			if (callback) { callback(json.error == null); }
        });
    }
	
	useEnvironment(envName, data, callback) {
		var self = this;
		this.api.useEnvironment(envName, data, function(json) {
			if (json.error) { alert(json.error); }
			else { self._updateEnironmentsFromJson(json); }
			if (callback) { callback(json.error == null); }
		});
	}

	setBusyTime(envName, hours, callback) {
		var self = this;
		this.api.setBusyTime(envName, hours, function(json) {
			if (json.error) { alert(json.error); }
			else { self._updateEnironmentsFromJson(json); }
			if (callback) { callback(json.error == null); }
		});
	}

	makeEnvFree(envName, callback) {
		var self = this;
		this.api.freeEnvironment(envName, function(json) {
			if (json.error) { alert(json.error); }
			else { self._updateEnironmentsFromJson(json); }
			if (callback) { callback(json.error == null); }
		});
	}
}
