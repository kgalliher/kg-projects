import esriRequest from "@arcgis/core/request";
import { VersionManagementService, Version } from "./VersionManagement";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

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
  public outputMessages = null;

  constructor(baseUrl: string, vms: VersionManagementService) {
    this._baseUrl = baseUrl;
    this._pfUrl = `${baseUrl}ParcelFabricServer`;
    this._recordsUrl = `${baseUrl}FeatureServer/1`;
    this.vms = vms;
    this._versionName = vms.getVersion().versionName;
    this.outputMessages = document.getElementById("outputMessages");
  }

  // function for messaging
  displayMessage(info) {
    this.outputMessages.innerHTML += info;
    this.outputMessages.scrollTop = this.outputMessages.scrollHeight;
  }

  clearMessages(){
    this.outputMessages.innerHTML = "";
  }

  getRecord(recordName: string) {
    return new Promise((resolve, reject) => {
      const fl = new FeatureLayer({
        url: this._recordsUrl
      })
  
      let query = fl.createQuery();
      query.where = `Name = '${recordName}'`;
      query.outFields = ["OBJECTID", "Name", "GlobalID"]
      query.gdbVersion = this._versionName;
      fl.queryFeatures(query)
        .then((res) => {
          resolve(res)

        })
        .catch((err) => {
          console.log(err);
          
        })
    })
  }
  setExistingRecord(recordName: string){
    return new Promise((resolve, reject) => {
      this.getRecord(recordName)
      .then((res) => {
        let recordId = res.features[0].attributes["GlobalID"];
        let record: Record = { recordName: recordName, recordGuid: recordId }
        this.activeRecord = record;
        this.displayMessage(`<br><span>Record already exists. Setting:</span> ${this.activeRecord.recordName}`)
        resolve(recordId);
      })
      .then(() => {
        Promise.resolve(this.createRecord(recordName));
      })
      .catch((err) => {
        console.log(err);
        
      })
  });
  }

  async checkRecordExists(recordName): Promise<any> {
    return new Promise((resolve, reject) => {
      const fl = new FeatureLayer({
        url: this._recordsUrl
      })
  
      let query = fl.createQuery();
      query.where = `Name = '${recordName}'`;
      query.outFields = ["OBJECTID", "Name", "GlobalID"]
      query.gdbVersion = this._versionName;
      fl.queryFeatures(query)
        .then((res) => {
          if(res.features.length > 0){
            resolve(true);
          }
          
          resolve(false);

          })
        .catch((err) => {
          console.log(err);
          
        })
    })
  }

  async createRecord(recordName: string): Promise<__esri.RequestResponse> {
    return new Promise((resolve, reject) => { 
      this.vms.toggleEditSession("startReading")
        .then((resp) => {
          this.vms.reserveObjectIds(this._recordsUrl, 1)
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
                    return this.activeRecord;
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
  
  assignFeatureToRecord(layerId: number, addedFeatureGuid: string): Promise<__esri.RequestResponse> {
    return new Promise((resolve, reject) => {
      this.vms.toggleEditSession("startReading")
      .then((res) => {
        const sessionId = this.vms.getSessionId();
        const activeRecordGuid = this.activeRecord.recordGuid;
        const versionName = this.vms.getVersion().versionName;

        let assignToRecordOptions = {
          "f": "json",
          "gdbVersion": versionName,
          "sessionId": sessionId,
          "record": activeRecordGuid,
          "parcelFeatures": `[{"id":"${addedFeatureGuid}","layerId":"${layerId}"}]`,
          "writeAttribute": "CreatedByRecord",
          "async": false,
        }

        esriRequest(this._pfUrl + "/assignFeaturesToRecord", {
          "method": "post",
          "responseType": "json",
          "query": assignToRecordOptions
        })
          .then(function (response) {
            if (response.data.success === true) {
              resolve(response.data.serviceEdits);

            }
          })
          .then(() => {
            // stop the reading session
            this.vms.toggleEditSession("stopReading");
          })
          .catch((err) => {
            this.vms.toggleEditSession("stopReading");
            reject(err);
          })
      })
      .catch((err) => {
        console.log(err);
        this.displayMessage(err);
      })
    })
  }
 
  createSeeds(): Promise<__esri.RequestResponse> {
    return new Promise((resolve, reject) => {
      this.vms.toggleEditSession("startReading")
      .then((res) => {
        const sessionId = this.vms.getSessionId();
        const activeRecordGuid = this.activeRecord.recordGuid;
        const versionName = this.vms.getVersion().versionName;

        let createSeedsOptions = {
          "f": "json",
          "gdbVersion": versionName,
          "sessionId": sessionId,
          "record": activeRecordGuid,
          "async": false,
        }

        esriRequest(this._pfUrl + "/createSeeds", {
          "method": "post",
          "responseType": "json",
          "query": createSeedsOptions
        })
          .then(function (response) {
            if (response.data.success === true) {
              resolve(response.data.serviceEdits);
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
        this.displayMessage(err);
      })
    })
  }

  buildRecord(): Promise<__esri.RequestResponse> {
    return new Promise((resolve, reject) => {
      this.vms.toggleEditSession("startReading")
      .then((res) => {
        const sessionId = this.vms.getSessionId();
        const activeRecordGuid = this.activeRecord.recordGuid;
        const versionName = this.vms.getVersion().versionName;

        const buildOptions = {
          "f": "json",
          "gdbVersion": versionName,
          "sessionId": sessionId,
          "record": activeRecordGuid,
          "async": false,
        }

        esriRequest(this._pfUrl + "/build", {
          "method": "post",
          "responseType": "json",
          "query": buildOptions
        })
          .then(function (response) {
            if (response.data.success === true) {
              // const resultVal = processMergeResult(response.data.serviceEdits)
              resolve(response.data.serviceEdits);

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
        this.displayMessage(err);
      })
    })
  }

  copyLinesTo(selectedFeatures: __esri.Feature[]): Promise<__esri.RequestResponse> {
    return new Promise((resolve, reject) => {
      this.vms.toggleEditSession("startReading")
      .then((res) => {
          let sessionId = this.vms.getSessionId();
          let activeRecordGuid = this.activeRecord.recordGuid;
          let versionName = this.vms.getVersion().versionName;
          let parentParcels: { id: string, layerId: string }[] = [];
          selectedFeatures.forEach((item) => {
            let parentParcel = { "id": item.attributes.GlobalID, "layerId": String(item.layer.layerId) };
            parentParcels.push(parentParcel);
          });
          let parentParcelsStr = JSON.stringify(parentParcels);
          const moment = Math.round((new Date()).getTime() / 1000);

          let copyLinesToOptions = {
            "f": "json",
            "gdbVersion": versionName,
            "sessionId": sessionId,
            "parentParcels": parentParcelsStr,
            "record": activeRecordGuid,
            "markParentAsHistoric": true,
            "useSourceLineAttributes": true,
            "useSourcePolygonAttributes": true,
            "targetParcelType": 15,
            "targetParcelSubtype": -1000,
            "attributeOverrides": '{"type":"PropertySet","propertySetItems":[]}',
            "async": false,
            
          }
          console.log(copyLinesToOptions);
          
          esriRequest(this._pfUrl + "/copyLinesToParcelType", {
            "method": "post",
            "responseType": "json",
            "query": copyLinesToOptions
          })
            .then(function (response) {
              if (response.data.success === true) {
                // const resultVal = processMergeResult(response.data.serviceEdits)
                resolve(response.data.serviceEdits);
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
          this.displayMessage(err);
        })
    });
  }

  mergeParcels(mergedFeatureName: string, mergedFeatureStatedArea: number, selectedFeatures: __esri.Feature[]): Promise<__esri.RequestResponse> {
    return new Promise((resolve, reject) => {
      this.vms.toggleEditSession("startReading")
        .then((res) => {
          let sessionId = this.vms.getSessionId();
          let activeRecordGuid = this.activeRecord.recordGuid;
          let versionName = this.vms.getVersion().versionName;
          let parentParcels: { id: string, layerId: string }[] = [];
          selectedFeatures.forEach((item) => {
            let parentParcel = { "id": item.attributes.GlobalID, "layerId": String(item.layer.layerId) };
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
                // const resultVal = processMergeResult(response.data.serviceEdits)
                resolve(response.data.serviceEdits);
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
