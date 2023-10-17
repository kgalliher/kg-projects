import FeatureTable from "@arcgis/core/widgets/FeatureTable.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import FeatureForm from "@arcgis/core/widgets/FeatureForm.js";
import FormTemplate from "@arcgis/core/form/FormTemplate.js";
import FieldElement from "@arcgis/core/form/elements/FieldElement";
import { VersionManagementService } from "./VersionManagement";
import { FeatureServerService } from "./FeatureServer";
const baseUrl = "https://krennic.esri.com/server/rest/services/Sheboygan109/"

// Access FeatureServer endpoint to create a record
let featureServer: FeatureServerService;

//Get a single VersionManagementService object.
const versionName = "ADMIN.EditorJS";
let currentVersion: string;
let vms = new VersionManagementService(baseUrl);

// Force the data elements to rely on a branch version being set.
vms.setVersion(versionName)
  .then((resp) => {
    if (resp) {
      currentVersion = vms.getVersion().versionName
      featureServer = new FeatureServerService(baseUrl, vms);
    }
    else
      throw "Could not set current version"
  })
  .then(() => {
    const recordsFeautreLyr = new FeatureLayer({
        url: featureServer.recordsUrl,
        gdbVersion: vms.getVersion().versionName,
        
    });
    
    const nameElement = new FieldElement({
      fieldName: "Name",
      label: "Parcel Name",
      editableExpression: "$feature",
    });

    const recordedDateElement = new FieldElement({
      fieldName: "RecordedDate",
      label: "Recorded Date",
      editableExpression: "$feature",
    });

    const surveyorElement = new FieldElement({
      fieldName: "Surveyor",
      label: "Surveyor",
      editableExpression: "$feature",
    });

    const formTemplate = new FormTemplate({
      description: "Create new parcel record:",
      elements: [nameElement, recordedDateElement, surveyorElement] // Add all elements to the template
    });

    // New FeatureForm for updating attributes
    const featureForm = new FeatureForm({
      container: "formDiv",
      layer: recordsFeautreLyr,
      formTemplate: formTemplate,
    });

    document.getElementById("btnAddRecord").onclick = () => {
      const updated = featureForm.getValues();
      if(updated){
        featureServer.createRecord(updated).then(() => {
          featureTable.refresh();
        });
      }
    };
    
    const featureTable = new FeatureTable({
        layer: recordsFeautreLyr,
        multiSortEnabled: true,
        visibleElements: {selectionColumn: false},
        editingEnabled: true,
        tableTemplate : { // autocastable to TableTemplate
            // The table template's columnTemplates are used to determine which attributes are shown in the table
              columnTemplates: [ // Array of either FieldColumnTemplates or GroupColumnTemplates
              { // autocastable to FieldColumnTemplate
                type: "field",
                fieldName: "Name",
                label: "Record Name",
                // This field will not be shown in the table
              },
              {
                type: "field",
                fieldName: "RecordedDate",
                label: "Recorded Date",
                // The table will be sorted by this column
                // in ascending order
                direction: "desc", // This is required for initial sorting
                initialSortPriority: 1 // This columns get priority after Enrollment
              },
              {
                type: "field",
                fieldName: "Surveyor",
                label: "Surveyor",
              },
              {
                type: "field",
                fieldName: "ParcelCount",
                label: "Parcel Count",
              },
            ] 
        },
        container: document.getElementById("tableDiv") as HTMLDivElement
    });
  });