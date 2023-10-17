import esriRequest from "@arcgis/core/request";

export interface Version {
  versionName: string;
  versionGuid: string
}

export class VersionManagementService {
  private _vmsUrl: string;
  private versionName: string = "";
  private vms: Promise<__esri.RequestResponse>
  private sessionId: string;
  private version: Version;

  constructor(baseUrl: string) {
    this._vmsUrl = baseUrl + "VersionManagementServer";
    this.version = this.getVersion();
    this.sessionId = this.getSessionId();
    this.vms = this.getVersionManagementService()
      .then((resp) => { return resp; })
      .catch((err) => { console.log(err); });
  }

  public async setVersion(versionName: string) : Promise<boolean> {
    let v = await this.getVersionByName(versionName)
    this.version = v;
    return v ? true : false;
  }

  public getVersion() : Version {
    return this.version;
  }

  public setSessionId(){
    this.sessionId =  `{${this.createUUID().toUpperCase()}}`; 
  }

  public getSessionId() : string {
    return this.sessionId;
  }

  public async getAllVersions() : Promise<Version[]> {
    return await this.vms.then((res) => { return res.data.versions });
  }
  
  private getVersionManagementService(): Promise<__esri.RequestResponse> {
    return new Promise<__esri.RequestResponse>((resolve, reject) => {
      esriRequest(this._vmsUrl + "/versions", { query: { f: "json" } })
        .then((resp) => {
          resolve(resp);
        })
        .catch((err) => {
          console.log(err)
          reject("Version error: " + err)
        })
    });
  }

  public async getVersionByName(versionName: string): Promise<Version> {
    return new Promise((resolve, reject) => {
      this.vms.then((resp) => {
        let v: Version;
        resp.data.versions.forEach((version: Version) => {
          if (version.versionName == versionName) {
            v = { ...version };
            resolve(v);
          }
           // look out for this!
        });
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      })
    });
  }

  public async toggleEditSession(flag: string): Promise<boolean>{
    let versionGuid = this.version.versionGuid.substr(1, this.version.versionGuid.indexOf("}") - 1)
    let editingUrl = `${this._vmsUrl}/versions/${versionGuid}/${flag}`
    if(flag == "startReading"){
      this.setSessionId(); // only generate a sessionId here on startEditing.
    }
    return new Promise((resolve, reject) => {
      esriRequest(editingUrl, {
        query: { "sessionId": this.sessionId, "f": "json" }
      })
        .then(() => {
          if(flag == "stopReading"){
            this.sessionId = "";
          }
          resolve(true);
        })
        .catch((err) => {
          console.log("Edit session error: " + err)
          this.purgeVersionLocks();
          reject(false)
        })
    });
  }

  public reserveObjectIds(url: string, qty: number): Promise<__esri.RequestResponse> {
    let sessionId = this.getSessionId();
    return new Promise((resolve, reject) => {
      esriRequest(url + "/reserveObjectIDs", {
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
        })
    })
  }

  public purgeVersionLocks() {
    let editingUrl = `${this._vmsUrl}/purgeLock`
    return new Promise((resolve, reject) => {
      esriRequest(editingUrl, {
        query: { "versionName": this.versionName, "f": "json" }
      })
        .then((resp) => {
          resolve(resp);
        })
        .catch((err) => {
          reject("Edit session error: " + err)
        })
    });
  }

  // generate sessionId guid
  public createUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) =>{
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
