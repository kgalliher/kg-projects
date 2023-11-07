import esriRequest from "@arcgis/core/request";
import VersionManagementService from "@arcgis/core/versionManagement/VersionManagementService.js";

export interface Version {
  versionName: string;
  versionGuid: string
}

export class VersionManagementUtils {
  private _vmsUrl: string;
  private versionName: string = "";
  private vms: VersionManagementService;
  private sessionId: string;
  private version: __esri.VersionIdentifier;

  constructor(baseUrl: string) {
    this._vmsUrl = baseUrl + "VersionManagementServer";
    this.vms = this.getVersionManagementService();
    this.version = this.getVersion();
    this.sessionId = this.getSessionId();
    this.versionName = this.versionName;
  }

  public async setVersion(versionName: string) : Promise<boolean> {
    this.versionName = versionName;
    let v = await this.getVersionByName()
    this.version = v;
    return v ? true : false;
  }

  public getVersion() : __esri.VersionIdentifier {
    return this.version;
  }

  public setSessionId(){
    this.sessionId =  `{${this.createUUID().toUpperCase()}}`; 
  }

  public getSessionId() : string {
    return this.sessionId;
  }

  public async getAllVersions() : Promise<__esri.VersionInfoJSON[]> {
    return await this.vms.load().then(() => { return this.vms.getVersionInfos() });
  }
  
  private getVersionManagementService(): VersionManagementService {
    const versionManagementService = new VersionManagementService({
      url: this._vmsUrl
    });
    return versionManagementService;
  }

  public async getVersionByName(): Promise<__esri.VersionIdentifier> {
    return await this.vms.getVersionIdentifierFromName(this.versionName);
    
  }

  public async toggleEditSession(flag: string, saveEdits: boolean=false): Promise<boolean>{
    if(flag === "startReading"){
      this.vms.load().then(async (res) => {
        console.log("START EDITING...", res.sourceJSON);
        await this.vms.startReading(this.version);
        const started = await this.vms.startEditing(this.version);
        return started;
      })
    }
    else if(flag === "stopReading") {
      this.vms.load().then(async (res) => {
        console.log("STOP EDITING...", res.sourceJSON);
        
        await this.vms.stopEditing(this.version, saveEdits);
        const stopped =  await this.vms.stopReading(this.version);
        return stopped;
      });
    }
    else { return false }
  }

  
}
