import esriRequest from "esri/request";
import { VersionManagementService, Version } from "./VersionMangement";

export interface Record {
  recordName: string;
  recordGuid: string;
}

export class ParcelFabricService {
  private _pfUrl: string;
  private _recordsUrl: string;
  private _versionName: string;
  private _sessionId: string;
  private _baseUrl: string;
  public activeRecord: Record;
  public vms: VersionManagementService;

  constructor(baseUrl: string, vms: VersionManagementService) {
    this._baseUrl = baseUrl;
    this._pfUrl = `${baseUrl}ParcelFabricServer`;
    this._recordsUrl = `${baseUrl}FeatureServer/1`;
    this.vms = vms;
    this._versionName = vms.getVersion().versionName;
  }

  createRecord(recordName: string): Promise<boolean> {
    return new Promise((resolve, reject) => { 
      this.vms.toggleEditSession("startReading")
        .then((resp) => {
          let recordOid = this.vms.reserveObjectIds(this._recordsUrl, 1)
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
                edits: `[{"id":1,"adds":[{"attributes":{"objectid":${objectId},"name":"${recordName}","recordtype":null,"recordeddate":null,"cogoaccuracy":null,"created_user":null,"create_date":null,"last_edited_user":null,"last_edited_date":null,"parcelcount":null,"globalid":"{${globalid}}","Shape__Area":0,"Shape__Length":0},"geometry":{"hasZ":true,"rings":[],"spatialReference":{"wkid":2926,"latestWkid":2926,"xyTolerance":0.0032808333333333331,"zTolerance":0.001,"mTolerance":0.001,"falseX":-117104300,"falseY":-99539600,"xyUnits":3048.0060960121928,"falseZ":-100000,"zUnits":10000,"falseM":-100000,"mUnits":10000}}}]}]`,
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
                  resolve(true);
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

  mergeParcels(mergedFeatureName: string, mergedFeatureStatedArea: number, selectedFeatures: __esri.Feature[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.vms.toggleEditSession("startReading")
        .then((res) => {
          let sessionId = this.vms.getSessionId();
          let activeRecordGuid = this.activeRecord.recordGuid;
          let versionName = this.vms.getVersion().versionName;
          let parentParcels: { id: string, layerId: string }[] = [];
          selectedFeatures.forEach((item) => {
            let parentParcel = { "id": item.attributes.globalid, "layerId": String(item.layer.layerId) };
            parentParcels.push(parentParcel);
          });
          let propertySet = `{"type":"PropertySet","propertySetItems":["name","${mergedFeatureName}","StatedArea", "${mergedFeatureStatedArea}", "isseed",0]}`;
          let parentParcelsStr = JSON.stringify(parentParcels);
          let moment = Math.round((new Date()).getTime() / 1000);
          let mergeOptions = {
            "f": "json",
            "gdbVersion": versionName,
            "sessionId": sessionId,
            "parentParcels": parentParcelsStr,
            "record": activeRecordGuid,
            "mergeInto": "{00000000-0000-0000-0000-000000000000}",
            "moment": moment,
            "targetParcelType": selectedFeatures[0].layer.layerId,
            "defaultAreaUnit": 109405,
            "attributeOverrides": propertySet,
          }
          esriRequest(this._pfUrl + "/merge", {
            "method": "post",
            "responseType": "json",
            "query": mergeOptions
          })
            .then(function (response) {
              if (response.data.success === true) {
                document.getElementById("writeAttr").innerHTML = "Successfully merged the parcels";
                resolve(true);
              }
            })
            .then(() => {
              // stop the reading session
              this.vms.toggleEditSession("stopReading");
            })
            .catch((err) => {
              reject(err);
            })
        })
        .catch((err) => {
          console.log(err);
        })
    });
  }
}
