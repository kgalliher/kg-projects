import EsriMap from "esri/Map";
import FeatureLayer from "esri/layers/FeatureLayer";
import LabelClass from "esri/layers/support/LabelClass";

export interface FLayer{
  name: string;
  flayer: FeatureLayer;
}

export class MapElements {
  private versionName: string;
  private _baseUrl: string;
  public mapLayers: {} = {};
  public map: __esri.Map;

  constructor(baseUrl:string, currentVersion: string){
    this._baseUrl = baseUrl;
    this.versionName = currentVersion;
    this.map = this.generateMapAndLayers();
  }

  addMapLayer(layerId: number, idLabel: string, versionName: string, outfields: string[], defQuery: string, labelClass: LabelClass): FeatureLayer {
    if(this.versionName == "")
      this.versionName = "sde.DEFAULT";

    let layer = new FeatureLayer({
      url: `${this._baseUrl}FeatureServer/${layerId}`,
      outFields: outfields,
      popupEnabled: false,
      id: idLabel,
      labelingInfo: labelClass,
      labelsVisible: false,
      gdbVersion: this.versionName,
      definitionExpression: defQuery,
    });

    this.mapLayers.push(layer);
    return layer;
  }

  refreshLayers(): void {
    let layers = this.mapLayers;
    for(let key of Object.keys(layers)){
      layers[key].refresh();
    }
  }
  generateMapAndLayers(): __esri.Map {
    // Map and Layers and labels
    const taxLabelClass = new LabelClass({
      labelExpressionInfo: { expression: "$feature.NAME" },
      symbol: {
        type: "text",  // autocasts as new TextSymbol()
        color: "black",
        haloSize: 1,
        haloColor: "white"
      }
    });

    const linesLabelClass = new LabelClass({
      labelExpressionInfo: { expression: "$feature.Distance + ' ft'" },
      symbol: {
        type: "text",  // autocasts as new TextSymbol()
        color: "green",
        haloSize: 1,
        haloColor: "white"
      }
    });
  
    const recordLabelClass = new LabelClass({
      labelExpressionInfo: { expression: "$feature.NAME" },
      labelPlacement: "always-horizontal",
      symbol: {
        type: "text",  // autocasts as new TextSymbol()
        color: "blue",
        font: { family: "Arial Unicode MS", size: 10, weight: "bold" },
        haloSize: 1,
        haloColor: "white"
      }
    });
  
    let parcelLayer = new FeatureLayer({
      url: `${this._baseUrl}FeatureServer/16`,
      outFields: ["name", "statedarea", "Shape__Area", "globalid"],
      popupEnabled: false,
      id: "taxParcels",
      labelingInfo: taxLabelClass,
      labelsVisible: false,
      gdbVersion: this.versionName,
      definitionExpression: "RetiredByRecord IS NULL",
    });
    this.mapLayers["parcels"] = parcelLayer;
  
    let historicParcelLayer = new FeatureLayer({
      url: `${this._baseUrl}FeatureServer/16`,
      outFields: ["name", "statedarea", "Shape__Area", "globalid"],
      popupEnabled: false,
      id: "taxParcels",
      labelingInfo: taxLabelClass,
      labelsVisible: false,
      gdbVersion: this.versionName,
      definitionExpression: "RetiredByRecord IS NOT NULL",
    });
    this.mapLayers["historicParcels"] = historicParcelLayer;

    let parcelLinesLayer = new FeatureLayer({
      title: "ParcelLines",
      url: `${this._baseUrl}FeatureServer/15`,
      popupEnabled: false,
      id: "taxParcelLines",
      labelingInfo: linesLabelClass,
      gdbVersion: this.versionName,
      definitionExpression: "RetiredByRecord IS NULL",
    });
    this.mapLayers["parcelLines"] = parcelLinesLayer;    
    
    let recordsLayer = new FeatureLayer({
      title: "records",
      url: `${this._baseUrl}FeatureServer/1`,
      popupEnabled: false,
      labelingInfo: recordLabelClass,
      id: "records",
      gdbVersion: this.versionName,
    });  
    this.mapLayers["records"] = recordsLayer;    
  
    recordsLayer.renderer = {
      type: "simple",
      symbol: {
        type: "simple-fill",
        outline: { width: 3, color: [0, 112, 255, 1] },
        style: "none"
      }
    }
  
    historicParcelLayer.renderer = {
      type: "simple",
      symbol: {
        type: "simple-fill",
        style: "forward-diagonal",
        outline: { color: [255, 0, 0, 1] },
        color: [255, 0, 0, 0.25]
      }
    }
  
    const map = new EsriMap({
      basemap: "streets",
      layers: [recordsLayer, historicParcelLayer, parcelLayer, parcelLinesLayer]
    });

    return map;
  }

  
}