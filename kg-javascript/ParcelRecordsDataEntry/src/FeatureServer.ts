import esriRequest from "@arcgis/core/request";
import { VersionManagementService } from "./VersionManagement";

export interface Record {
  recordName: string;
  recordGuid: string;
}

export class FeatureServerService {
  private _versionName: string;
  private _baseUrl: string;
  public recordsUrl: string;
  public vms: VersionManagementService;
  public outputMessages = null;

  constructor(baseUrl: string, vms: VersionManagementService) {
    this._baseUrl = baseUrl;
    this.recordsUrl = `${baseUrl}FeatureServer/1`;
    this.vms = vms;
    this._versionName = vms.getVersion().versionName;
  }

  createRecord(attributes: any): Promise<__esri.RequestResponse> {
    const recordName: string = attributes.Name;
    const recordedDate: string = attributes.RecordedDate;
    const surveyor: string = attributes.Surveyor;

    return new Promise((resolve, reject) => { 
      this.vms.toggleEditSession("startReading")
        .then((resp) => {
          this.vms.reserveObjectIds(this.recordsUrl, 1)
            .then((resp) => { return resp; })
            .catch((err) => { console.log(err); })
            .then((recordOid) => {
              let sessionId = this.vms.getSessionId();
              const objectId = recordOid.data.firstObjectId;
              const globalid = this.vms.createUUID().toUpperCase();
              let params = {
                f: "json",
                rollbackOnFailure: true,
                sessionId: sessionId,
                useGlobalIds: true,
                gdbVersion: this._versionName,
                returnEditMoment: true,
                returnServiceEditsOption: "originalAndCurrentFeatures",
                usePreviousEditMoment: false,
                edits: `[{"id": 1,"adds": [{"attributes": {"objectid": ${objectId},"name": "${recordName}","recordtype": null,"recordeddate": ${recordedDate},"cogoaccuracy": null,"created_user": null,"create_date": null,"last_edited_user": null,"last_edited_date": null,"parcelcount": null,"Surveyor": ${surveyor}, "globalid": "{${globalid}}","Shape__Area": 0,"Shape__Length": 0},"geometry": {"hasZ": true,"rings": [],"spatialReference": {"wkid": 2926,"latestWkid": 2926,"xyTolerance": 0.0032808333333333331,"zTolerance": 0.001,"mTolerance": 0.001,"falseX": -117104300,"falseY": -99539600,"xyUnits": 3048.0060960121928,"falseZ": -100000,"zUnits": 10000,"falseM": -100000,"mUnits": 10000}}}]}]`,
              }
              return params
            })
            .then((params) => {
              esriRequest(this._baseUrl + "FeatureServer/applyEdits", {
                method: "post",
                "responseType": "json",
                query: params
              })
                .then((resp) => {
                  if (resp.data[0].addResults[0].success) {
                    let recordId = resp.data[0].addResults[0].globalId;
                    let record: Record = { recordName: recordName, recordGuid: recordId }
                    this.activeRecord = record;
                  }
                })
                .then((resp) => {
                  resolve(resp);
                  this.vms.toggleEditSession("stopReading");
                })
                .catch((err) => {
                  console.log(err);
                  reject(false);
                })
            })
        })
        .catch((err) => {
            reject(false);
            console.log(err)
        })
    });
  }
}
