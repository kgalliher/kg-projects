import EsriMap from "@arcgis/core/Map";
import FormTemplate from "@arcgis/core/form/FormTemplate";
import FieldElement from "@arcgis/core/form/elements/FieldElement";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import LabelClass from "@arcgis/core/layers/support/LabelClass";

export interface FLayer{
  name: string;
  flayer: FeatureLayer;
}

export class MapElements {
  private versionName: string;
  private _baseUrl: string;
  public mapLayers: FeatureLayer[] = [];
  public map: __esri.Map;

  constructor(baseUrl:string, currentVersion: string){
    this._baseUrl = baseUrl;
    this.versionName = currentVersion;
    this.map = this.generateMapAndLayers();
  }

  addMapLayer(layerId: number, idLabel: string, outfields: string[], defQuery: string, labelClass: LabelClass): FeatureLayer {
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
      labelExpressionInfo: {
        expression: "Round($feature.Distance, 2)"
      },
      symbol: {
        type: "text",  // autocasts as new TextSymbol()
        color: "black",
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
      title: "Tax Parcels",
      url: `${this._baseUrl}FeatureServer/15`,
      outFields: ["name", "statedarea", "Shape__Area", "globalid"],
      popupEnabled: false,
      id: "taxParcels",
      labelingInfo: taxLabelClass,
      labelsVisible: false,
      gdbVersion: this.versionName,
      definitionExpression: "RetiredByRecord IS NULL",
    });
    this.mapLayers["parcels"] = parcelLayer;
  
    const historicParcelLayerRenderer = {
      type: "simple",
      symbol: {
        type: "simple-fill",
        style: "forward-diagonal",
        outline: { color: [255, 0, 0, 1] },
        color: [255, 0, 0, 0.25]
      }
    }
    let historicParcelLayer = new FeatureLayer({
      title: "Historic Tax Parcels",
      url: `${this._baseUrl}FeatureServer/15`,
      outFields: ["name", "statedarea", "Shape__Area", "globalid"],
      popupEnabled: false,
      id: "historicTaxParcels",
      labelingInfo: taxLabelClass,
      labelsVisible: false,
      gdbVersion: this.versionName,
      renderer: historicParcelLayerRenderer,
      definitionExpression: "RetiredByRecord IS NOT NULL",
    });
    this.mapLayers["historicParcels"] = historicParcelLayer;

    let parcelLinesLayer = new FeatureLayer({
      title: "Parcel Lines",
      url: `${this._baseUrl}FeatureServer/14`,
      outFields: ["CreatedByRecord", "RetiredByRecord", "Direction", "Distance"],
      popupEnabled: false,
      id: "taxParcelLines",
      labelingInfo: linesLabelClass,
      gdbVersion: this.versionName,
      definitionExpression: "RetiredByRecord IS NULL",
    });
    this.mapLayers["parcelLines"] = parcelLinesLayer;    
    
    const recordsLayerRenderer = {
      type: "simple",  
      symbol: {
        type: "simple-fill",  // autocasts as new SimpleMarkerSymbol()
        size: 6,
        color: null,
        outline: { width: 3, color: [0, 112, 255, 1] },
      }
    }

    let recordsLayer = new FeatureLayer({
      title: "records",
      url: `${this._baseUrl}FeatureServer/1`,
      popupEnabled: false,
      labelingInfo: recordLabelClass,
      id: "records",
      gdbVersion: this.versionName,
      renderer: recordsLayerRenderer
    });

    this.mapLayers["records"] = recordsLayer;    
  
    const map = new EsriMap({
      basemap: "streets-vector",
      layers: [recordsLayer, historicParcelLayer, parcelLayer, parcelLinesLayer]
    });

    return map;
  }

  generateFormTemplate(): FormTemplate{
    const nameElement = new FieldElement({
      fieldName: "Name",
      label: "Parcel Name",
      editableExpression: "$feature",
    });

    const statedAreaElement = new FieldElement({
      fieldName: "StatedArea",
      label: "Stated Area",
      editableExpression: "$feature",
    });

    const formTemplate = new FormTemplate({
      description: "Parcel Attributes",
      elements: [nameElement, statedAreaElement]
    });

    return formTemplate;
  }

  lineLabelExpression(){
    const arcade = document.getElementById("cogo-label").text;
    return arcade;
  }

}