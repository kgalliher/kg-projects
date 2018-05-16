using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ESRI.ArcGIS.esriSystem;
using ESRI.ArcGIS.Geodatabase;
using ESRI.ArcGIS.Geometry;

namespace GeodatabaseModel
{
    /// <summary>
    /// From online sample.  Trying to understand how listeners work.
    /// </summary>
    class ReconcileConflictListener
    {
        IFeatureWorkspace featureWorkspace = null;
        ISelectionSet updateUpdates = null;

        public ReconcileConflictListener(IVersion version)
        {
            featureWorkspace = (IFeatureWorkspace)version;
            IVersionEvents_Event versionEvent = (IVersionEvents_Event)version;
            versionEvent.OnConflictsDetected += new IVersionEvents_OnConflictsDetectedEventHandler(OnConflictsDetected);
        }

        public void OnConflictsDetected(ref bool conflictsRemoved, ref bool errorOccurred, ref string errorString)
        {
            try
            {
                IVersionEdit4 versionEdit4 = (IVersionEdit4)featureWorkspace;

                // Get the various versions on which to output information.
                IFeatureWorkspace commonAncestorFWorkspace = (IFeatureWorkspace)versionEdit4.CommonAncestorVersion;
                IFeatureWorkspace preReconcileFWorkspace = (IFeatureWorkspace)versionEdit4.PreReconcileVersion;
                IFeatureWorkspace reconcileFWorkspace = (IFeatureWorkspace)versionEdit4.ReconcileVersion;

                IEnumConflictClass enumConflictClass = versionEdit4.ConflictClasses;
                IConflictClass conflictClass = null;
                while ((conflictClass = enumConflictClass.Next()) != null)
                {
                    IDataset dataset = (IDataset)conflictClass;

                    // Make sure the class is a feature class.
                    if (dataset.Type == esriDatasetType.esriDTFeatureClass)
                    {
                        String datasetName = dataset.Name;
                        IFeatureClass featureClass = featureWorkspace.OpenFeatureClass(datasetName);

                        Console.WriteLine("Conflicts on feature class {0}", datasetName);

                        // Get all UpdateUpdate conflicts.
                        updateUpdates = conflictClass.UpdateUpdates;
                        if (updateUpdates.Count > 0)
                        {
                            // Get conflict feature classes on the three reconcile versions.
                            IFeatureClass featureClassPreReconcile = preReconcileFWorkspace.OpenFeatureClass(datasetName);
                            IFeatureClass featureClassReconcile = reconcileFWorkspace.OpenFeatureClass(datasetName);
                            IFeatureClass featureClassCommonAncestor = commonAncestorFWorkspace.OpenFeatureClass(datasetName);

                            // Iterate through each OID, outputting information.
                            IEnumIDs enumIDs = updateUpdates.IDs;
                            int oid = -1;
                            while ((oid = enumIDs.Next()) != -1) //Loop through all conflicting features. 
                            {
                                Console.WriteLine("UpdateUpdate conflicts on feature {0}", oid);

                                // Get conflict feature on the three reconcile versions.
                                IFeature featurePreReconcile = featureClassPreReconcile.GetFeature(oid);
                                IFeature featureReconcile = featureClassReconcile.GetFeature(oid);
                                IFeature featureCommonAncestor = featureClassCommonAncestor.GetFeature(oid);

                                // Check to make sure each shape is different than the common ancestor (conflict is on shape field).
                                if (IsShapeInConflict(featureCommonAncestor, featurePreReconcile, featureReconcile))
                                {
                                    Console.WriteLine(" Shape attribute has changed on both versions...");
                                }
                            }
                        }
                    }
                }
            }

            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        private bool IsShapeInConflict(IFeature commonAncestorFeature, IFeature preReconcileFeature, IFeature reconcileFeature)
        {
            // 1st check: Common Ancestor with PreReconcile.
            // 2nd check: Common Ancestor with Reconcile. 
            // 3rd check: Reconcile with PreReconcile (case of same change on both versions).
            if (IsGeometryEqual(commonAncestorFeature.ShapeCopy,
                preReconcileFeature.ShapeCopy) || IsGeometryEqual
                (commonAncestorFeature.ShapeCopy, reconcileFeature.ShapeCopy) ||
                IsGeometryEqual(reconcileFeature.ShapeCopy, preReconcileFeature.ShapeCopy))
            {
                return false;
            }

            else
            {
                return true;
            }
        }

        private bool IsGeometryEqual(IGeometry shape1, IGeometry shape2)
        {
            if (shape1 == null & shape2 == null)
            {
                return true;
            }
            else if (shape1 == null ^ shape2 == null)
            {
                return false;
            }
            else
            {
                IClone clone1 = (IClone)shape1;
                IClone clone2 = (IClone)shape2;
                return clone1.IsEqual(clone2);
            }
        }
    }
}
