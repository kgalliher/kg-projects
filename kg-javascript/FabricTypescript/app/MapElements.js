var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/Map", "esri/layers/FeatureLayer", "esri/layers/support/LabelClass"], function (require, exports, Map_1, FeatureLayer_1, LabelClass_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Map_1 = __importDefault(Map_1);
    FeatureLayer_1 = __importDefault(FeatureLayer_1);
    LabelClass_1 = __importDefault(LabelClass_1);
    class MapElements {
        constructor(baseUrl, currentVersion) {
            this.mapLayers = {};
            this._baseUrl = baseUrl;
            this.versionName = currentVersion;
            this.map = this.generateMapAndLayers();
        }
        addMapLayer(layerId, idLabel, versionName, outfields, defQuery, labelClass) {
            if (this.versionName == "")
                this.versionName = "sde.DEFAULT";
            let layer = new FeatureLayer_1.default({
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
        refreshLayers() {
            let layers = this.mapLayers;
            for (let key of Object.keys(layers)) {
                layers[key].refresh();
            }
        }
        generateMapAndLayers() {
            // Map and Layers and labels
            const taxLabelClass = new LabelClass_1.default({
                labelExpressionInfo: { expression: "$feature.NAME" },
                symbol: {
                    type: "text",
                    color: "black",
                    haloSize: 1,
                    haloColor: "white"
                }
            });
            const linesLabelClass = new LabelClass_1.default({
                labelExpressionInfo: { expression: "$feature.Distance + ' ft'" },
                symbol: {
                    type: "text",
                    color: "green",
                    haloSize: 1,
                    haloColor: "white"
                }
            });
            const recordLabelClass = new LabelClass_1.default({
                labelExpressionInfo: { expression: "$feature.NAME" },
                labelPlacement: "always-horizontal",
                symbol: {
                    type: "text",
                    color: "blue",
                    font: { family: "Arial Unicode MS", size: 10, weight: "bold" },
                    haloSize: 1,
                    haloColor: "white"
                }
            });
            let parcelLayer = new FeatureLayer_1.default({
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
            let historicParcelLayer = new FeatureLayer_1.default({
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
            let parcelLinesLayer = new FeatureLayer_1.default({
                title: "ParcelLines",
                url: `${this._baseUrl}FeatureServer/15`,
                popupEnabled: false,
                id: "taxParcelLines",
                labelingInfo: linesLabelClass,
                gdbVersion: this.versionName,
                definitionExpression: "RetiredByRecord IS NULL",
            });
            this.mapLayers["parcelLines"] = parcelLinesLayer;
            let recordsLayer = new FeatureLayer_1.default({
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
            };
            historicParcelLayer.renderer = {
                type: "simple",
                symbol: {
                    type: "simple-fill",
                    style: "forward-diagonal",
                    outline: { color: [255, 0, 0, 1] },
                    color: [255, 0, 0, 0.25]
                }
            };
            const map = new Map_1.default({
                basemap: "streets",
                layers: [recordsLayer, historicParcelLayer, parcelLayer, parcelLinesLayer]
            });
            return map;
        }
    }
    exports.MapElements = MapElements;
});
//# sourceMappingURL=MapElements.js.map