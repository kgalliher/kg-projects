import MapView from "esri/views/MapView";
import Graphic from "esri/Graphic";
import Expand from "esri/widgets/Expand";
import FeatureForm from "esri/widgets/FeatureForm";
import { VersionManagementService } from "./VersionMangement";
import { ParcelFabricService } from "./ParcelFabric";
import { MapElements } from "./MapElements";
import FeatureLayer from "esri/layers/FeatureLayer";

let baseUrl = "https://krennic.esri.com/server/rest/services/SheboyganREST/";

// Variables for controlling the selection/deselection of features
let editFeature: Graphic, highlight;
let selectedFeatures: any[] | __esri.Feature[] = [];
let highlights = [];

// Get a single ParcelFabricService object
let pfs: ParcelFabricService;

//Get a single VersionManagementService object.
const versionName = "admin.EditorJS";
let currentVersion: string;
let vms = new VersionManagementService(baseUrl);

// Force the UI elements to rely on a version being set.
vms.setVersion(versionName)
  .then((resp) => {
    if (resp) {
      currentVersion = vms.getVersion().versionName
      pfs = new ParcelFabricService(baseUrl, vms);
    }
    else
      throw "Could not set current version"
  })
  .then(() => {
    // Hiding the map and layer details in another class UserInterface
    let mapUi = new MapElements(baseUrl, currentVersion);
    const map = mapUi.generateMapAndLayers();

    // Shows the access of a single layer
    let parcelLayer = mapUi.mapLayers["parcels"];

    // MapView should probably find its way into MapElements class
    const view = new MapView({
      container: "viewDiv",
      map: map,
      center: [-87.740324, 43.750109],
      zoom: 18
    });

    // New FeatureForm for updating attributes
    const featureForm = new FeatureForm({
      container: "formDiv",
      layer: parcelLayer,
      fieldConfig: [
        {
          name: "name",
          label: "Parcel Name"
        },
        {
          name: "statedarea",
          label: "Stated Area"
        }
      ]
    });

    // Active function to listen to selected feature events
    selectExistingFeature()

    // Let the games begin (dismisses the instructions and opens the form)
    let btnBegin = document.getElementById("btnBegin");
    btnBegin.addEventListener("click", function () {
      if (addFeatureDiv.style.display === "block") {
        toggleEditingDivs("none", "block");
      }
    });

    // Check if a user clicked on an parcel feature.
    function selectExistingFeature() {
      view.on("click", function (event) {
        if (document.getElementById("viewDiv").style.cursor != "crosshair") {
          view.hitTest(event).then(function (response) {
            // If a user clicks on an parcel feature, select the feature.
            if (response.results.length === 0) {
              toggleEditingDivs("block", "none");
              highlights.forEach((h) => {
                h.remove();
              });
              selectedFeatures.length = 0;
            }
            else if (response.results[0].graphic && response.results[0].graphic.layer.id == "taxParcels") {
              if (addFeatureDiv.style.display === "block") {
                toggleEditingDivs("none", "block");
              }
              selectFeature(response.results[0].graphic.attributes[parcelLayer.objectIdField]);
            }
          });
        }
      });
    }

    // Highlights the clicked feature and displays some attributes of the last selected feature.
    function selectFeature(objectId) {
      // query feature from the server
      parcelLayer
        .queryFeatures({
          objectIds: [objectId],
          outFields: ["*"],
          returnGeometry: true
        })
        .then(function (results) {
          if (results.features.length > 0) {
            editFeature = results.features[0];
            // display the attributes of last selected feature in the form
            // featureForm.feature = editFeature;
            // capture attributes of selected features
            captureFeatures(editFeature);
            // highlight the feature on the view
            view.whenLayerView(editFeature.layer)
              .then(function (layerView) {
                highlight = layerView.highlight(editFeature);
                highlights.push(highlight);
              });
          }
        });
    }

    // Function to populate feature array. Async issue when pushing directly in function above.
    function captureFeatures(feature: __esri.Feature) {
      selectedFeatures.push(feature);
    }

    function zoomToSelected(editFeatureLayer: FeatureLayer) {
      editFeatureLayer
        .when(function () {
          return layer.queryExtent();
        })
        .then(function (response) {
          view.goTo(response.extent);
        });
    }

    // Query the feature service for the selected features
    function selectPinsForMerge(pins: number[]) {
      let whereClause = "name in (";
      pins.forEach(pin => {
        whereClause += `'${pin}',`
      });
      whereClause += ")";
      whereClause = whereClause.replace(",)", ")");

      const queryParams = parcelLayer.createQuery();
      queryParams.where = whereClause;
      parcelLayer
        .queryFeatures(queryParams)
        .then((results: __esri.FeatureSet) => {
          if (results.features.length > 0) {
            editFeature = results.features[0];
            for (let i = 0; i < results.features.length; i++) {
              const element = results.features[i].attributes;
              selectFeature(element.objectid);
            }
            return editFeature;
          }
          else { throw "Cannot find features " + pins }
        })
        .then((res: Graphic) => {
          zoomToSelected(res.layer);
        })
    }

    // Expand widget for the editArea div.
    const editExpand = new Expand({
      expandIconClass: "esri-icon-edit",
      expandTooltip: "Expand Edit",
      expanded: true,
      view: view,
      content: document.getElementById("editArea")
    });

    view.ui.add(editExpand, "top-right");
    // input boxes for the attribute editing
    const addFeatureDiv = document.getElementById("addFeatureDiv");
    const attributeEditing = document.getElementById("featureUpdateDiv");

    // Controls visibility of addFeature or attributeEditing divs
    function toggleEditingDivs(addDiv, attributesDiv) {
      addFeatureDiv.style.display = addDiv;
      attributeEditing.style.display = attributesDiv;
      document.getElementById("updateInstructionDiv").style.display = addDiv;
    }

    // Clear the selection
    let btnClear = document.getElementById("btnClear");
    btnClear.addEventListener("click", function () {

      highlights.forEach((h) => {
        h.remove();
      });
      selectedFeatures.length = 0;
      document.getElementById("writeAttr").innerHTML = "";
    })

    // PARCEL FABRIC ----------------------
    // Event listeners that execute the FS and ParcelFabric functions
    let btnCreateRec = document.getElementById("btnCreateRec");
    btnCreateRec.addEventListener("click", () => {
      document.getElementById("writeAttr").innerHTML = "creating record...";
      let newRecName = document.getElementById("recordName").value;
      let parcelPins = document.getElementById("parcelPins").value;

      selectPinsForMerge(parcelPins.split(","));

      // Create a new record with the ParcelFabricService
      pfs.createRecord(newRecName)
        .then(() => {
          document.getElementById("writeAttr").innerHTML = "Created record: " + pfs.activeRecord.recordName;
        })
        .catch((err) => {
          document.getElementById("writeAttr").innerHTML = "Error creating record: " + err;
        });
    });

    // Merge the selected parcels.
    let btnMerge = document.getElementById("btnMerge");
    btnMerge.addEventListener("click", () => {
      const updated = featureForm.getValues();
      let mergedFeatureName = updated.name;
      let mergedFeatureStatedArea = updated.statedarea;

      // Merge the selected with the ParcelFabricService
      pfs.mergeParcels(mergedFeatureName, mergedFeatureStatedArea, selectedFeatures)
        .then(() => {
          mapUi.refreshLayers();
        })
        .catch((err) => {
          console.log(err);
          document.getElementById("writeAttr").innerHTML = "Error merging parcels: " + err;
        })
    })
  })
  //-------------End opening 'then' ------------------//
  .catch((err) => {
    alert("An error occured in the main application: " + err);
  })





