class ServerApi {

    constructor() {
        this.invoke = window.app.invoke;
    }

    _processRespose(data, callback) {
        var json = {};
        if (typeof data == 'object') {
            json = data;
        } else {
            try {
                json = JSON.parse(data);
            } catch (error) {
                json.error = data;
            }
        }
        console.log("Api response:", json);
        if (callback) {
            callback(json);
        }
    }

	_sendApiRequestPost(cmd, json, callback) {
        var self = this;
        console.log("API request:", cmd, json);
        this.invoke(cmd, json).then((data) => {
			self._processRespose(data, callback);
		}).catch((e) => {
            console.error("API error:", e);
            if (callback) callback({ error: ''+e});
        });
    }

    getAllEnvironments(callback) {
		this._sendApiRequestPost('getAllEnv', { }, callback);
    }

	useEnvironment(envName, data, callback) {
		var json = {
			envName: envName,
			data: data
		};
		this._sendApiRequestPost('useEnv', json, callback);
	}

	setBusyTime(envName, hours, callback) {
		var json = {
			hours: hours,
			envName: envName
		};
		this._sendApiRequestPost('setBusyTime', json, callback);
	}

	freeEnvironment(envName, callback) {
		var json = {
			envName: envName
		};
		this._sendApiRequestPost('freeEnv', json, callback);
	}
}
  