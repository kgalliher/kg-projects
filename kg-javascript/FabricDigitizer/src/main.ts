import MapView from "@arcgis/core/views/MapView";
import Graphic from "@arcgis/core/Graphic";
import Expand from "@arcgis/core/widgets/Expand";
import FeatureForm from "@arcgis/core/widgets/FeatureForm";
import FormTemplate from "@arcgis/core/form/FormTemplate";
import FieldElement from "@arcgis/core/form/elements/FieldElement";
import Editor from "@arcgis/core/widgets/Editor";
import { VersionManagementService } from "./VersionManagement";
import { ParcelFabricService } from "./ParcelFabric";
import { MapElements } from "./MapElements";

let baseUrl = "https://krennic.esri.com/server/rest/services/HCAD_Subset/";
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
      document.getElementById("currentVersionName").innerHTML = currentVersion;
    }
    else
      throw "Could not set current version"
  })
  .then(() => {
    // Hiding the map and layer details in another class UserInterface
    let mapUi = new MapElements(baseUrl, currentVersion);
    const map = mapUi.generateMapAndLayers();

    // Capture the active record GUID
    let activeRecordGuid = "";
    const setActiveRecord = (recordGuid) => {
      activeRecordGuid = recordGuid;

    }

    // Shows the access of a single layer
    let parcelLayer = mapUi.mapLayers["parcels"];
    let parcelPointsLayer = mapUi.mapLayers["parcelPoints"];
    let parcelLinesLayer = mapUi.mapLayers["parcelLines"];
    let recordsLayer = mapUi.mapLayers["records"];

    // MapView should probably find its way into MapElements class
    const view = new MapView({
      container: "viewDiv",
      map: map,
      center: [-95.2396433, 29.7710610], //3,160,659.12E 13,847,835.96N ftUS 
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

    function clearMessages() {
      outputMessages.innerHTML = "";
    }

    function setButtonDisabled(idName: string, isDisabled: boolean) {
      const element = (document.getElementById(idName) as HTMLButtonElement)
      element.disabled = isDisabled;
      const currentEnabledValue = element.getAttribute("disabled")
      if (currentEnabledValue != null)
        element.style.backgroundColor = "lightgray";
      else
        element.style.backgroundColor = "#0079c1";
    }

    function processResult(serviceEdits: Array<any>) {
      let values = "";
      if (serviceEdits) {
        serviceEdits.forEach(layer => {
          if (layer.id === 15) {
            let attributes = null;
            if (layer.editedFeatures.hasOwnProperty("adds")) {
              attributes = layer.editedFeatures.adds[0].attributes;
            }
            else if (layer.editedFeatures.hasOwnProperty("updates")) {
              attributes = layer.editedFeatures.updates[0][0].attributes;
            }
            else if (layer.editedFeatures.hasOwnProperty("deletes")) {
              attributes = layer.editedFeatures.updates[0].attributes;
            }

            console.log('adds :>> ', attributes);
            values = `
              <br><span>Parcel Edits:</span>
              <span>Objectid:</span>&nbsp;&nbsp;${attributes.OBJECTID},<br>
              <span>Name:</span>&nbsp;&nbsp;${attributes.Name},<br>
              <span>Record GUID:</span>&nbsp;&nbsp;${attributes.CreatedByRecord},<br>
              <span>Stated Area:</span>&nbsp;&nbsp;${attributes.StatedArea}<br>
              `
          }
          if (layer.id === 14) {
            let attributes = null;
            if (layer.editedFeatures.hasOwnProperty("adds")) {
              attributes = layer.editedFeatures.adds[0].attributes;
            }
            else if (layer.editedFeatures.hasOwnProperty("updates")) {
              attributes = layer.editedFeatures.updates[0][0].attributes;
            }
            else if (layer.editedFeatures.hasOwnProperty("deletes")) {
              attributes = layer.editedFeatures.updates[0][0].attributes;
            }
            console.log('Line edits :>> ', attributes);
            values = `
              <br><span>Line Edits:</span>
              <span>Objectid:</span>&nbsp;&nbsp;${attributes.OBJECTID},<br>
              <span>CreatedByRecord:</span>&nbsp;&nbsp;${attributes.CreatedByRecord},<br>
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
      let pinValue = selectedFeatures[selectedFeatures.length - 1].attributes.Name;
      displayMessage(`<span>Selected Parcel:</span> ${pinValue}<br>`);
      selectedParcelPins.push(pinValue);
      if (selectedFeatures.length == 1) {
        setButtonDisabled("btnCopyLines", false);
      }
      if (selectedFeatures.length >= 2) {
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

    // Expand form widget for the editArea div.
    const editExpand = new Expand({
      expandIconClass: "esri-icon-edit",
      expandTooltip: "Expand Edit",
      expanded: true,
      view: view,
      content: document.getElementById("editArea")
    });

    const expressionString = `
      var guid = ${activeRecordGuid};
      if(IsEmpty($feature.CreatedByRecord)){
        return "poop";
      }

      return "doodoo";
    `
    const linesFormTemplate = new FormTemplate({
      elements: [
        new FieldElement({
          fieldName: "Distance",
          label: "Distance",
        }),
        new FieldElement({
          fieldName: "Direction",
          label: "Direction",
          valueExpression: "createdByRecord"
        }),
        new FieldElement({
          fieldName: "CreatedByRecord",
          label: "Created By Record",
        }),
        new FieldElement({
          fieldName: "RetiredByRecord",
          label: "Retired By Record",
        }),
      ],
      expressionInfos: [{
        name: "createdByRecord",
        title: "Created By Record",
        returnType: "string",
        expression: expressionString
      }]
    });

    const parcelsFormTemplate = new FormTemplate({
      elements: [
        new FieldElement({
          fieldName: "Name",
          label: "Name",
          valueExpression: "updateName"
        }),
        new FieldElement({
          fieldName: "StatedArea",
          label: "Stated Area",
          valueExpression: "updateAreaToAcres"
        }),
        new FieldElement({
          fieldName: "CreatedByRecord",
          label: "Created By Record",
        }),
        new FieldElement({
          fieldName: "RetiredByRecord",
          label: "Retired By Record",
        }),
      ],
      expressionInfos: [{
        name: "updateName",
        title: "Update Name",
        returnType: "string",
        expression: `return "parcelname"`
      }]
    });

    const pointsFormTemplate = new FormTemplate({
      elements: [
        new FieldElement({
          fieldName: "X",
          label: "X"
        }),
        new FieldElement({
          fieldName: "Y",
          label: "Y",
        }),
        new FieldElement({
          fieldName: "Z",
          label: "Z",
        }),
        new FieldElement({
          fieldName: "CreatedByRecord",
          label: "Created By Record",
        }),
        new FieldElement({
          fieldName: "RetiredByRecord",
          label: "Retired By Record",
        }),
      ]
    });

    const editor = new Editor({
      view: view,
      snappingOptions: { enabled: true, featureSources: [{ layer: parcelLinesLayer }, { layer: parcelPointsLayer }] },
      layerInfos: [{
        layer: parcelLinesLayer,
        enabled: true,
        formTemplate: linesFormTemplate,
      },
      {
        layer: parcelLayer,
        enabled: true,
        formTemplate: parcelsFormTemplate,
      },
      {
        layer: parcelPointsLayer,
        enabled: true,
        formTemplate: pointsFormTemplate,
      },
      {
        layer: recordsLayer,
        enabled: false,
      },
      ]
    });

    // When drawing a line, send the globalid to AssignFeaturesToRecord to add CreatedByRecord value
    parcelLinesLayer.on("edits", function (event) {
      if (event.addedFeatures.length > 0) {
        let layerId = parcelLinesLayer.layerId;
        let addedFeatureGuid = event.addedFeatures[0].globalId;
        pfs.assignFeatureToRecord(layerId, addedFeatureGuid)
          .then((res) => {
            processResult(res);
          })
      }
    });

    parcelLayer.on("edits", function (event) {
      if (event.addedFeatures.length > 0) {
        let layerId = parcelLayer.layerId;
        let addedFeatureGuid = event.addedFeatures[0].globalId;
        pfs.assignFeatureToRecord(layerId, addedFeatureGuid)
          .then((res) => {
            processResult(res);
          })
      }
    });

    parcelPointsLayer.on("edits", function (event) {
      if (event.addedFeatures.length > 0) {
        let layerId = parcelPointsLayer.layerId;
        let addedFeatureGuid = event.addedFeatures[0].globalId;
        pfs.assignFeatureToRecord(layerId, addedFeatureGuid)
          .then((res) => {
            processResult(res);
          })
      }
    });

    view.ui.add(editExpand, "top-right");
    view.ui.add(editor, "top-left");

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
      setButtonDisabled("btnCreateRec", false);
      (document.getElementById("parcelPins") as HTMLInputElement).value = "";
      displayMessage("<br><span>Selection cleared</span><br/>");
    })

    // PARCEL FABRIC ----------------------
    // Event listeners that execute the FS and ParcelFabric functions
    let btnCreateRec = document.getElementById("btnCreateRec");

    btnCreateRec.addEventListener("click", async () => {
      let newRecName = (document.getElementById("recordName") as HTMLInputElement).value;
      let parcelPins = (document.getElementById("parcelPins") as HTMLInputElement).value;
      displayMessage(`<br><span>Creating record:</span> ${newRecName}`);
      selectPinsForMerge(parcelPins.split(","));

      // Create a new record with the ParcelFabricService
      const recordExists = await pfs.checkRecordExists(newRecName)
      console.log(recordExists);

      if (recordExists) {
        await pfs.setExistingRecord(newRecName);
        displayMessage(`<br><span>Successfully set active record</span> ${pfs.activeRecord.recordName}`)
        document.getElementById("activeRecordName").innerHTML = pfs.activeRecord.recordName;
        setActiveRecord(pfs.activeRecord.recordGuid)
      }
      else {
        pfs.createRecord(newRecName)
          .then((res) => {
            displayMessage(`<br><span>Successfully set active record</span> ${pfs.activeRecord.recordName}`)
            let parcelPinInput = (document.getElementById("parcelPins") as HTMLInputElement);
            parcelPinInput.value = "";
            selectedParcelPins = [];
            document.getElementById("activeRecordName").innerHTML = pfs.activeRecord.recordName;
            // document.getElementById("activeRecordGuid").innerHTML = pfs.activeRecord.recordGuid;
            setActiveRecord(pfs.activeRecord.recordGuid)

          })
          .catch((err) => {
            displayMessage(`<br><span>Error creating/setting record:</span> ${err}`)
          });
      }
      // })
    });

    // Create seeds with active record.
    let btnCreateSeeds = document.getElementById("btnCreateSeeds");
    btnCreateSeeds.addEventListener("click", () => {
      displayMessage("<br><span>Creating Seeds</span>")
      // Merge the selected with the ParcelFabricService
      pfs.createSeeds()
        .then((res) => {
          const createSeedsResult = processResult(res);
          displayMessage(`<br><span>Create Seeds result:</span><p>Success</p><br>${createSeedsResult}<br>`);
          mapUi.refreshLayers();
        })
        .catch((err) => {
          console.log(err);
          displayMessage(`<br><span>Error creating seeds:<span> ${err}`)
        })
    })

    // Create seeds with active record.
    let btnBuildParcels = document.getElementById("btnBuildParcels");
    btnBuildParcels.addEventListener("click", () => {
      const recordName = (document.getElementById("recordName") as HTMLInputElement).value;
      displayMessage(`<br><span>Building parcels in:</span><p>${recordName}</p><br>`)
      // Build parcels with the ParcelFabricService
      pfs.buildRecord()
        .then((res) => {
          const buildParcelsResult = processResult(res);
          displayMessage(`<br><span>Build Parcels result:</span><p>Success</p><br>${buildParcelsResult}<br>`);
          mapUi.refreshLayers();
        })
        .catch((err) => {
          console.log(err);
          displayMessage(`<br><span>Error building parcels:<span> ${err}`)
        })
    })
  })
  //-------------End opening 'then' ------------------//
  .catch((err) => {
    alert("An error occured in the main application: " + err);
  })