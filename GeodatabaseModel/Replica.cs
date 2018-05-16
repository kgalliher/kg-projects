using ESRI.ArcGIS.Geodatabase;
using ESRI.ArcGIS.GeoDatabaseDistributed;
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;

namespace GeodatabaseModel
{
    class Replica
    {
        
        /// <summary>
        /// Command prompt utility to add an object to a replica.  Modified from online sample
        /// </summary>
        /// <param name="workspace"></param>
        /// <param name="replicaName"></param>
        /// <param name="datasetName"></param>
        /// <param name="parentDatabase"></param>
        /// <param name="parentOwner"></param>
        /// <param name="datasetType"></param>
        /// <param name="rowsType"></param>
        /// <param name="useGeometry"></param>
        /// <param name="queryDef"></param>
        /// <param name="showInstructions"></param>
        public static void AddDatasetToReplica(IWorkspace workspace, String replicaName,
            String datasetName, String parentDatabase, String parentOwner,
            esriDatasetType datasetType, esriRowsType rowsType, Boolean useGeometry,
            String queryDef, bool showInstructions)
        {
            string instructions = "- Ensure the new feature class is registered as versioned and has globalIds\n- Feature classes must be simple.  Cannot reside in feature dataset\n"; 
            
            if (showInstructions)
            {
                Console.WriteLine(instructions);
            }
            try
            {
                //find the existing replica
                IWorkspaceReplicas2 workspaceReplicas2 = workspace as IWorkspaceReplicas2;
                IReplica replica = workspaceReplicas2.get_ReplicaByName(replicaName);
                
                //Create the replica dataset object for the new feature class or table.
                IReplicaDataset replicaDataset = new ReplicaDatasetClass();
                IReplicaDatasetEdit replicaDatasetEdit = (IReplicaDatasetEdit)replicaDataset;
                replicaDatasetEdit.Type = datasetType;
                replicaDatasetEdit.Name = datasetName;
                replicaDatasetEdit.ParentDatabase = parentDatabase;
                replicaDatasetEdit.ParentOwner = parentOwner;
                replicaDatasetEdit.ReplicaID = replica.ReplicaID;

                // Add the new feature class to the replica
                IWorkspaceReplicasAdmin2 workspaceReplicasAdmin2 = (IWorkspaceReplicasAdmin2)workspaceReplicas2;
                try
                {
                    workspaceReplicasAdmin2.RegisterReplicaDataset(replicaDataset, rowsType,
                      useGeometry, queryDef, null, replica);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("An error occurred registering the replica:\n" + ex.Message);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("An error occurred: " + ex.Message);
            }
        }

        /// <summary>
        /// Simply list the feature classes involved in a replica
        /// </summary>
        /// <param name="workspace"></param>
        /// <param name="replicaName"></param>
        public static void ListReplicaFeatureClasses(IWorkspace workspace, string replicaName)
        {
            try
            {
                //find the existing replica
                IWorkspaceReplicas2 workspaceReplicas2 = workspace as IWorkspaceReplicas2;
                IReplica replica = workspaceReplicas2.get_ReplicaByName(replicaName);

                List<string> featureClasses = new List<string>();

                IReplicaDataset replicaDataset;

                while ((replicaDataset = replica.ReplicaDatasets.Next()) != null)
                    featureClasses.Add(replicaDataset.Name);


                Console.WriteLine("Feature classes in parent replica:");
                foreach (var parentFc in featureClasses)
                    Console.WriteLine("\t{0}", parentFc);

            }
            catch (Exception ex)
            {
                Console.WriteLine("An error occured: " + ex.Message);
            }
        }


        /// <summary>
        /// Simply list the replica names in 
        /// </summary>
        /// <param name="connectionFile"></param>
        /// <returns></returns>
        public static List<string> GetReplicaNames(string connectionFile)
        {
            List<string> replicaNames = new List<string>();
            IGeoDataServer2 gds = new GeoDataServerClass();
            IGeoDataServerInit gdsInit = (IGeoDataServerInit)gds;

            gdsInit.InitFromFile(connectionFile);
            IGPReplicas replicas = gds.Replicas;
            for (int i = 0; i < replicas.Count; i++)
            {
                //replicaNames.Add(replicas.Element[i].);
            }

            return replicaNames;
        }

        /// <summary>
        /// Compare feature classes on both sides of a replica
        /// </summary>
        /// <param name="parentWorkspace"></param>
        /// <param name="relativeWorkspace"></param>
        /// <param name="replicaName"></param>
        public static void ListReplicaFeatureClassesParentAndChild(IWorkspace parentWorkspace, IWorkspace relativeWorkspace, string replicaName)
        {
            try
            {
                //find the existing replica
                IWorkspaceReplicas2 parentWorkspaceReplicas2 = parentWorkspace as IWorkspaceReplicas2;
                IReplica parentReplica = parentWorkspaceReplicas2.get_ReplicaByName(replicaName);

                IWorkspaceReplicas2 relativeWorkspaceReplicas2 = relativeWorkspace as IWorkspaceReplicas2;
                IReplica relativeReplica = relativeWorkspaceReplicas2.get_ReplicaByName(replicaName);

                List<string> parentFcs = new List<string>();
                List<string> relativeFcs = new List<string>();

                IReplicaDataset replicaDataset;
                IReplicaDataset relativeDataset;

                while ((replicaDataset = parentReplica.ReplicaDatasets.Next()) != null)
                    parentFcs.Add(replicaDataset.Name);


                while ((relativeDataset = relativeReplica.ReplicaDatasets.Next()) != null)
                    relativeFcs.Add(relativeDataset.Name);

                Console.WriteLine("Feature classes in parent replica:");
                foreach (var parentFc in parentFcs)
                    Console.WriteLine("\t{0}", parentFc);


                Console.WriteLine("Feature classes in relative replica:");
                foreach (var relativeFc in relativeFcs)
                {
                    Console.WriteLine("\t{0}", relativeFc);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("An error occured: " + ex.Message);
            }
        }

        /// <summary>
        /// Wipe out all replicas in a workspace
        /// </summary>
        /// <param name="connectionFile"></param>
        public static void UnregisterAllReplicas(string connectionFile)
        {
            IGeoDataServer2 gds = new GeoDataServerClass();
            IGeoDataServerInit gdsInit = (IGeoDataServerInit) gds;

            gdsInit.InitFromFile(connectionFile);
            IGPReplicas replicas = gds.Replicas;

            Console.WriteLine("Attempting to unregister {0} replicas", replicas.Count);

            for (int i = 0; i < replicas.Count; i++)
            {
                Console.WriteLine("Removing replica: {0}\n", replicas.Element[i].Name);
                gds.UnregisterReplica(replicas.Element[i].Name);
                
            }
        }

        /// <summary>
        /// Synchronize a replica - From online sample
        /// </summary>
        /// <param name="parentGDS"></param>
        /// <param name="childGDS"></param>
        /// <param name="replicaName"></param>
        /// <param name="conflictPolicy"></param>
        /// <param name="syncDirection"></param>
        /// <param name="columnLevel"></param>
        public static void SynchronizeReplica(IGeoDataServer parentGDS, IGeoDataServer childGDS,
            String replicaName, esriReplicationAgentReconcilePolicy conflictPolicy,
            esriReplicaSynchronizeDirection syncDirection, Boolean columnLevel)
        {
            try
            {
                // Iterate through the replicas of the parent GeoDataServer.
                IGPReplicas gpReplicas = parentGDS.Replicas;
                IGPReplica parentReplica = null;
                for (int i = 0; i < gpReplicas.Count; i++)
                {
                    // See if the unqualified replica name matches the replicaName parameter.
                    IGPReplica currentReplica = gpReplicas.get_Element(i);
                    String currentReplicaName = currentReplica.Name;
                    int dotIndex = currentReplicaName.LastIndexOf(".") + 1;
                    String baseName = currentReplicaName.Substring(dotIndex,
                        currentReplicaName.Length - dotIndex);
                    if (baseName.ToLower() == replicaName.ToLower())
                    {
                        parentReplica = currentReplica;
                        break;
                    }
                }

                // Check to see if the parent replica was found.
                if (parentReplica == null)
                {
                    throw new ArgumentException(
                        "The requested replica could not be found on the parent GDS.");
                }

                // Iterate through the replica of the child GeoDataServer.
                gpReplicas = childGDS.Replicas;
                IGPReplica childReplica = null;
                for (int i = 0; i < gpReplicas.Count; i++)
                {
                    // See if the unqualified replica name matches the replicaName parameter.
                    IGPReplica currentReplica = gpReplicas.get_Element(i);
                    String currentReplicaName = currentReplica.Name;
                    int dotIndex = currentReplicaName.LastIndexOf(".") + 1;
                    String baseName = currentReplicaName.Substring(dotIndex,
                        currentReplicaName.Length - dotIndex);
                    if (baseName.ToLower() == replicaName.ToLower())
                    {
                        childReplica = currentReplica;
                        break;
                    }
                }

                // Check to see if the child replica was found.
                if (childReplica == null)
                {
                    throw new ArgumentException(
                        "The requested replica could not be found on the child GDS.");
                }

                // Synchronize the replica.
                IReplicationAgent replicationAgent = new ReplicationAgentClass();
                replicationAgent.SynchronizeReplica(parentGDS, childGDS, parentReplica,
                    childReplica, conflictPolicy, syncDirection, columnLevel);
            }
            catch (COMException comExc)
            {
                throw new Exception(String.Format(
                    "Sync replica errored: {0}, Error Code: {1}", comExc.Message,
                    comExc.ErrorCode), comExc);
            }
            catch (Exception exc)
            {
                throw new Exception(String.Format("Sync replica errored: {0}", exc.Message)
                    , exc);
            }
        }
    }
}


