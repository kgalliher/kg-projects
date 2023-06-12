var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/request"], function (require, exports, request_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    request_1 = __importDefault(request_1);
    class VersionManagementService {
        constructor(baseUrl) {
            this._vmsUrl = baseUrl + "VersionManagementServer";
            this.vms = this.getVersionManagementService()
                .then((resp) => { return resp; })
                .catch((err) => { console.log(err); });
        }
        setVersion(versionName) {
            return __awaiter(this, void 0, void 0, function* () {
                let v = yield this.getVersionByName(versionName);
                this.version = v;
                return v ? true : false;
            });
        }
        getVersion() {
            return this.version;
        }
        setSessionId() {
            this.sessionId = `{${this.createUUID().toUpperCase()}}`;
        }
        getSessionId() {
            return this.sessionId;
        }
        getAllVersions() {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.vms.then((res) => { return res.data.versions; });
            });
        }
        getVersionManagementService() {
            return new Promise((resolve, reject) => {
                request_1.default(this._vmsUrl + "/versions", { query: { f: "json" } })
                    .then((resp) => {
                    resolve(resp);
                })
                    .catch((err) => {
                    console.log(err);
                    reject("Version error: " + err);
                });
            });
        }
        getVersionByName(versionName) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, reject) => {
                    this.vms.then((resp) => {
                        let v;
                        resp.data.versions.forEach(version => {
                            if (version.versionName == versionName) {
                                v = Object.assign({}, version);
                            }
                        });
                        resolve(v);
                    })
                        .catch((err) => {
                        console.log(err);
                        reject(err);
                    });
                });
            });
        }
        toggleEditSession(flag) {
            return __awaiter(this, void 0, void 0, function* () {
                let versionGuid = this.version.versionGuid.substr(1, this.version.versionGuid.indexOf("}") - 1);
                let editingUrl = `${this._vmsUrl}/versions/${versionGuid}/${flag}`;
                if (flag == "startReading") {
                    this.setSessionId(); // only generate a sessionId here on startEditing.
                }
                return new Promise((resolve, reject) => {
                    request_1.default(editingUrl, {
                        query: { "sessionId": this.sessionId, "f": "json" }
                    })
                        .then((resp) => {
                        if (flag == "stopReading") {
                            this.sessionId = null;
                        }
                        resolve(true);
                    })
                        .catch((err) => {
                        console.log("Edit session error: " + err);
                        this.purgeVersionLocks();
                        reject(false);
                    });
                });
            });
        }
        reserveObjectIds(url, qty) {
            let sessionId = this.getSessionId();
            return new Promise((resolve, reject) => {
                request_1.default(url + "/reserveObjectIDs", {
                    method: "post",
                    query: {
                        f: "json",
                        sessionId: sessionId,
                        gdbVersion: this.versionName,
                        requestedCount: qty,
                    }
                })
                    .then((resp) => {
                    resolve(resp);
                })
                    .catch((err) => {
                    reject("Cannot reserve OIDs: " + err);
                });
            });
        }
        purgeVersionLocks() {
            let editingUrl = `${this._vmsUrl}/purgeLock`;
            return new Promise((resolve, reject) => {
                request_1.default(editingUrl, {
                    query: { "versionName": this.versionName, "f": "json" }
                })
                    .then((resp) => {
                    resolve(resp);
                })
                    .catch((err) => {
                    reject("Edit session error: " + err);
                });
            });
        }
        // generate sessionId guid
        createUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    }
    exports.VersionManagementService = VersionManagementService;
});
//# sourceMappingURL=VersionMangement.js.map