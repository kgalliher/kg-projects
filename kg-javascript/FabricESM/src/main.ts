import MapView from "@arcgis/core/views/MapView";
import Graphic from "@arcgis/core/Graphic";
import Expand from "@arcgis/core/widgets/Expand";
import FeatureForm from "@arcgis/core/widgets/FeatureForm";
import FormTemplate from "@arcgis/core/form/FormTemplate";
import FieldElement from "@arcgis/core/form/elements/FieldElement";
import { VersionManagementService } from "./VersionManagement";
import { ParcelFabricService } from "./ParcelFabric";
import { MapElements } from "./MapElements";

let baseUrl = "https://krennic.esri.com/server/rest/services/Sheboygan109/";
const outputMessages = document.getElementById("outputMessages");

// Variables for controlling the selection/deselection of features
let editFeature: Graphic, highlight;
let selectedFeatures: any[] | __esri.Feature[] = [];
let selectedParcelPins = [];
let highlights = [];

// Get a single ParcelFabricService object
let pfs: ParcelFabricService;

//Get a single VersionManagementService object.
const versionName = "ADMIN.EditorJS";
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
      elements: [nameElement, statedAreaElement] // Add all elements to the template
    });

    // New FeatureForm for updating attributes
    const featureForm = new FeatureForm({
      container: "formDiv",
      layer: parcelLayer,
      formTemplate: formTemplate,
    });

    // Active function to listen to selected feature events
    selectExistingFeature()

    // function for messaging
    function displayMessage(info) {
      outputMessages.innerHTML += info;
      outputMessages.scrollTop = outputMessages.scrollHeight;
    }

    function clearMessages(){
      outputMessages.innerHTML = "";
    }

    function toggleButtonAvailability(idName: string, isDisabled: boolean){
      const element = (document.getElementById(idName) as HTMLButtonElement)
      element.disabled = isDisabled;
      const currentEnabledValue = element.getAttribute("disabled")
      if(currentEnabledValue != null)
        element.style.backgroundColor = "lightgray";
      else
        element.style.backgroundColor = "#0079c1";
    }

    function processMergeResult(serviceEdits: Array<any>){
      let values = "";
      if(serviceEdits){
        serviceEdits.forEach(layer => {
          if(layer.id === 15){
            const adds = layer.editedFeatures.adds[0].attributes;
            console.log('adds :>> ', adds);
            values = `
              <span>Objectid:</span>&nbsp;&nbsp;${adds.OBJECTID},<br>
              <span>Name:</span>&nbsp;&nbsp;${adds.Name},<br>
              <span>Record GUID:</span>&nbsp;&nbsp;${adds.CreatedByRecord},<br>
              <span>Stated Area:</span>&nbsp;&nbsp;${adds.StatedArea}<br>
              `
          }
        });
      }
      return ((values.length > 0) ? values : "Result not found.");
    }

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
            featureForm.feature = editFeature;
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
      let pinValue = selectedFeatures[selectedFeatures.length -1].attributes.Name;
      displayMessage(`<span>Selected Parcel:</span> ${pinValue}<br>`);
      selectedParcelPins.push(pinValue);
      if(selectedFeatures.length >= 2){
        toggleButtonAvailability("btnCreateRec", false);
        toggleButtonAvailability("btnMerge", false);
        let parcelPins = selectedParcelPins.join(); 
        let parcelPinInput = (document.getElementById("parcelPins") as HTMLInputElement);
        parcelPinInput.value = parcelPins;
      }
    }

    function zoomToSelected(extent) {
      view.goTo(extent);
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
              selectFeature(element.OBJECTID);
            }
            return editFeature;
          }
          else { throw "Cannot find features " + pins }
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
      selectedParcelPins = [];
      toggleButtonAvailability("btnCreateRec", true);
      toggleButtonAvailability("btnMerge", true);
      (document.getElementById("parcelPins") as HTMLInputElement).value = "";
      displayMessage("<br><span>Selection cleared</span>");
    })
    
  // PARCEL FABRIC ----------------------
    // Event listeners that execute the FS and ParcelFabric functions
    let btnCreateRec = document.getElementById("btnCreateRec");

    btnCreateRec.addEventListener("click", () => {
      let newRecName = (document.getElementById("recordName")as HTMLInputElement).value;
      let parcelPins = (document.getElementById("parcelPins")as HTMLInputElement).value;
      displayMessage(`<br><span>Creating record:</span> ${newRecName}`);
      selectPinsForMerge(parcelPins.split(","));

      // Create a new record with the ParcelFabricService
      pfs.createRecord(newRecName)
        .then(() => {
          displayMessage(`<br><span>Created record</span> ${pfs.activeRecord.recordName}`)
          let parcelPinInput = (document.getElementById("parcelPins") as HTMLInputElement);
          parcelPinInput.value = "";
          selectedParcelPins = [];
        })
        .catch((err) => {
          displayMessage(`<br><span>Error creating record:</span> ${err}`)
        });
    });

    // Merge the selected parcels.
    let btnMerge = document.getElementById("btnMerge");
    btnMerge.addEventListener("click", () => {
      const updated = featureForm.getValues();
      let mergedFeatureName = updated.Name;
      let mergedFeatureStatedArea = updated.StatedArea;
      displayMessage("<br><span>Merging parcels</span>")
      // Merge the selected with the ParcelFabricService
      pfs.mergeParcels(mergedFeatureName, mergedFeatureStatedArea, selectedFeatures)
        .then((res) => {
          const mergeResult = processMergeResult(res);
          displayMessage(`<br><span>Merge result:</span><p>Success</p><br>${mergeResult}`);
          mapUi.refreshLayers();
        })
        .catch((err) => {
          console.log(err);
          displayMessage(`<br><span>Error merging parcels:<span> ${err}`)
        })
    })
  })
  //-------------End opening 'then' ------------------//
  .catch((err) => {
    alert("An error occured in the main application: " + err);
  })