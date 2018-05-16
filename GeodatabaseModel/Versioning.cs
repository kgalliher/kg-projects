using ESRI.ArcGIS.esriSystem;
using ESRI.ArcGIS.Geodatabase;
using ESRI.ArcGIS.Geometry;
using System;
using System.Collections.Generic;

namespace GeodatabaseModel
{
    class Versioning
    {

        /// <summary>
        /// Simple list of versions in a workspace
        /// </summary>
        /// <param name="ws"></param>
        public static void ListVersions(IWorkspace ws)
        {

            Console.WriteLine("Connection created...");
            IVersionedWorkspace versionedWorkspace = (IVersionedWorkspace) ws;
            IEnumVersionInfo enumVersionInfo = versionedWorkspace.Versions;
            IVersionInfo version = (IVersionInfo) enumVersionInfo.Next();
            while (version != null)
            {
                Console.WriteLine(version.VersionName);
                version = (IVersionInfo)enumVersionInfo.Next();
            }
        }

        /// <summary>
        /// From online sample - List edit differences between two versions.
        /// </summary>
        /// <param name="diffType"></param>
        /// <param name="workspace"></param>
        /// <param name="parentVersionName"></param>
        /// <param name="childVersionName"></param>
        /// <param name="featureClassName"></param>
        public static void FindVersionDifferences(bool diffType, IWorkspace workspace, string parentVersionName, string childVersionName, string featureClassName)
        {
            IVersion childVersion = null;
            IVersion parentVersion = null;
            IDifferenceCursor differenceCursor = null;
            IVersionedWorkspace versionedWorkspace = workspace as IVersionedWorkspace;
            try
            {
                childVersion = versionedWorkspace.FindVersion(childVersionName);
                parentVersion = versionedWorkspace.FindVersion(parentVersionName);
            }
            catch (Exception ex)
            {
                Console.WriteLine("An error occured finding the version: " + ex.Message);
            }

            IVersion2 childVersion2 = childVersion as IVersion2;
            IVersion commonAncestorVersion = childVersion2.GetCommonAncestor(parentVersion);

            //Cast the childVersion to IFeatureWorkspace to open the table
            IFeatureWorkspace parentFeatureWorkspace = parentVersion as IFeatureWorkspace;
            ITable parentTable = parentFeatureWorkspace.OpenTable(featureClassName);

            //Cast the childVersion to IFeatureWorkspace to open the table
            IFeatureWorkspace childFeatureWorkspace = childVersion as IFeatureWorkspace;
            ITable childTable = childFeatureWorkspace.OpenTable(featureClassName);

            //Cast the common ancestor to a feature workspae to open the table
            IFeatureWorkspace commonAncestorFeatureWorkspace = commonAncestorVersion as IFeatureWorkspace;
            ITable commonAncestorTable = commonAncestorFeatureWorkspace.OpenTable(featureClassName);

            /* Cast to IVersionedTable to get a difference cursor.  The diffType bool will denote checking
             * changes in the common ancestor or conflicts with the parent
             */

            if (diffType)
            {
                IVersionedTable versionedTable = childTable as IVersionedTable;
                differenceCursor = versionedTable.Differences(parentTable,
                    esriDifferenceType.esriDifferenceTypeUpdateUpdate, null);
                Console.WriteLine("Checking for updated features in conflict between {0} and {1}", childVersionName, parentVersionName);
            }
            else
            {
                IVersionedTable versionedTable = childTable as IVersionedTable;
                differenceCursor = versionedTable.Differences(commonAncestorTable,
                    esriDifferenceType.esriDifferenceTypeUpdateNoChange, null);
                Console.WriteLine("Checking for updated features in common ancestor between {0} and {1}", childVersionName, parentVersionName);
            }
            

            //Access the changes
            IRow differenceRow = null;
            int objectId = -1;
            differenceCursor.Next(out objectId, out differenceRow);
            if (differenceRow == null)
            {
                Console.WriteLine("No changes detected...");
            }
            else
            {
                while (objectId != -1)
                {
                    Console.WriteLine("Objectid of updated row: {0}", objectId);
                    differenceCursor.Next(out objectId, out differenceRow);
                }
            }
        }

        /// <summary>
        /// From online sample - get a selection set of features in conflict.
        /// </summary>
        /// <param name="workspace"></param>
        /// <returns></returns>
        public static ISelectionSet GetUpdateConflicts(IWorkspace workspace)
        {
            IFeatureWorkspace featureWorkspace = (IFeatureWorkspace)workspace;
            IVersionEdit4 versionEdit4 = (IVersionEdit4)featureWorkspace;

            IFeatureWorkspace commonAncestorWorkspace = (IFeatureWorkspace)versionEdit4.CommonAncestorVersion;
            IFeatureWorkspace preReconcileWorkspace = (IFeatureWorkspace)versionEdit4.PreReconcileVersion;
            IFeatureWorkspace reconcileWorkspace = (IFeatureWorkspace)versionEdit4.ReconcileVersion;

            IEnumConflictClass enumConflictClass = versionEdit4.ConflictClasses;
            IConflictClass conflictClass = null;

            while ((conflictClass = enumConflictClass.Next()) != null)
            {
                IDataset dataset = (IDataset)conflictClass;

                if (dataset.Type == esriDatasetType.esriDTFeatureClass)
                {
                    String datasetName = dataset.Name;
                    IFeatureClass featureClass = featureWorkspace.OpenFeatureClass(datasetName);
                    ISelectionSet updateSelectionSet = conflictClass.UpdateUpdates;
                    Console.WriteLine("Conflicts on feature class {0}", datasetName);
                    return updateSelectionSet;
                }
            }

            return null;
        }

        /// <summary>
        /// Enable archiving on a feature class and specify your own _H table name
        /// </summary>
        /// <param name="ws"></param>
        /// <param name="HTableName"></param>
        /// <param name="featureClassName"></param>
        public static void EnableArchiving(IWorkspace ws, string HTableName, string featureClassName)
        {
            IFeatureWorkspace fws = ws as IFeatureWorkspace;
            //IFeatureClass featureClass = fws.OpenFeatureClass("ArchiveFeatureClass");
            IArchivableObject archObject = (IArchivableObject)fws.OpenFeatureClass(featureClassName);
            IArchiveRegistrationInfo regInfo = new ArchiveRegistrationInfoClass()
            {
                ArchiveTableName = HTableName,
                DatasetName = featureClassName,
            };

            ISet hSet = new SetClass();

            hSet.Add(regInfo);
            try
            {
                if (!archObject.IsArchiving)
                {
                    archObject.EnableArchiving(hSet, DateTime.Now as object, true);
                    Console.WriteLine("Done archiving");
                }
                else
                {
                    Console.WriteLine(string.Format("The feature class '{0}' is already archive enabled!", featureClassName));
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("There was an error archiving the feature class\n" + ex.Message);
            }
        }

        public static void UpdateExtent(IWorkspace ws)
        {
            IFeatureWorkspace fws = ws as IFeatureWorkspace;
            IFeatureClass featureClass = fws.OpenFeatureClass("SDE.T_2_DIRTYAREAS");
            IFeatureClassManage manageFc = featureClass as IFeatureClassManage;
            try
            {
                Console.WriteLine("Attemtpting to update the dirty area table");
                manageFc.UpdateExtent();
                Console.WriteLine("Finished");
                
            }
            catch (Exception ex)
            {
                Console.WriteLine("An error occurred updating the dirty area extent: " + ex.Message);
            }
        }

        /// <summary>
        /// Just reconcile.  List conflicts if found
        /// </summary>
        /// <param name="workspace"></param>
        /// <param name="childVersionName"></param>
        /// <param name="parentVersionName"></param>
        /// <returns></returns>
        public static bool ReconcileOnly(IWorkspace workspace, string childVersionName, string parentVersionName)
        {
            IGeometryCollection geomCollection = new GeometryBagClass();
            int oid;
            var timestamp = DateTime.Now;
            
            IVersion childVersion = null;
            IVersion parentVersion = null;
            bool conflicts = false;
            IVersionedWorkspace versionedWorkspace = workspace as IVersionedWorkspace;           

            try
            {
                Console.WriteLine("Starting reconcile:");
                Console.WriteLine("Reconcile {0} with {1} - {2}", childVersionName, parentVersionName, timestamp);

                childVersion = versionedWorkspace.FindVersion(childVersionName);
                parentVersion = versionedWorkspace.FindVersion(parentVersionName);
                Console.WriteLine("IVersion instantiated for parent and child versions. - {0}", timestamp);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Version not found: " + ex.Message);
            }

            IMultiuserWorkspaceEdit multiuserWorkspaceEdit = childVersion as IMultiuserWorkspaceEdit;
            IWorkspaceEdit wksEdit = childVersion as IWorkspaceEdit2;
            IVersionEdit4 versionEdit = wksEdit as IVersionEdit4;

            if (multiuserWorkspaceEdit.SupportsMultiuserEditSessionMode(esriMultiuserEditSessionMode.esriMESMVersioned))
            {
                multiuserWorkspaceEdit.StartMultiuserEditing(esriMultiuserEditSessionMode.esriMESMVersioned);
                try
                {
                    Console.WriteLine("Reconcile using Reconcile4 - {0}", timestamp);
                    conflicts = versionEdit.Reconcile4(parentVersion.VersionName, true, false, true, true);

                    if (conflicts)
                    {
                        Console.WriteLine("Conflicts detected!");
                        IEnumConflictClass enumConflictClass = versionEdit.ConflictClasses;
                        IConflictClass conflictClass = null;

                        while ((conflictClass = enumConflictClass.Next()) != null)
                        {
                            oid = conflictClass.UpdateUpdates.IDs.Next();
                            Console.WriteLine("Found conflict in Selection Set "+ oid);
                        }
                    }
                    
                    
                }
                catch (Exception ex)
                {
                    Console.WriteLine("An error occurred during the reconcile: " + ex.Message);
                    Console.WriteLine("Inner exception: " + ex.InnerException);
                    foreach (KeyValuePair<String, String> pair in ex.Data)
                    {
                        Console.WriteLine(pair.Key + " -- " + pair.Value);
                    }
                    Console.WriteLine("Source: " + ex.Source);
                    Console.WriteLine("StackTrace: " + ex.StackTrace);
                    Console.WriteLine("TargetSite: " + ex.TargetSite);

                }
            }
            return conflicts;
        }

        /// <summary>
        /// Simple register as versioned
        /// </summary>
        /// <param name="dataset"></param>
        public static void RegisterAsVersioned(IDataset dataset)
        {

            Console.WriteLine(dataset.Type.ToString());
            IVersionedObject3 versionedObject = (IVersionedObject3) dataset;

            if (versionedObject.IsRegisteredAsVersioned)
            {
                Console.WriteLine(String.Format("{0} is already registered as versioned!", dataset.Name));
            }
            else
            {
                versionedObject.RegisterAsVersioned(true);
                Console.WriteLine(String.Format("Finished registering {0} as versioned!", dataset.Name));
            }

        }

        /// <summary>
        /// Recreate a missing versioned view.
        /// </summary>
        /// <param name="featureClass"></param>
        public static void RecreateVersionedView(IFeatureClass featureClass)
        {
            IVersionedView vv = (IVersionedView) featureClass;
            vv.CreateVersionedView("testversionedview_evw"); 
        }
    }
}
