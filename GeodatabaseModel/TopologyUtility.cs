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
    class TopologyUtility
    {
        //For non-Z Aware feature classes
        public static void CreateTopology(IWorkspace workspace, string topologyName, string featureDatasetName, bool zClusterTolerance, IFeatureClass[] featureClassesToAdd, bool validateNow)
        {
            
            IFeatureWorkspace fws = workspace as IFeatureWorkspace;
            IFeatureDataset fds = fws.OpenFeatureDataset(featureDatasetName);
            
            ITopologyContainer2 topologyContainer = fds as ITopologyContainer2;

            ITopology topology = null;

            if (zClusterTolerance)
            {
                topology = topologyContainer.CreateTopologyEx(topologyName, topologyContainer.DefaultClusterTolerance,
                    topologyContainer.DefaultZClusterTolerance, -1, "");
            }
            else
            {
                topology = topologyContainer.CreateTopology(topologyName, topologyContainer.DefaultClusterTolerance, -1, "");
            }

            foreach (var featureClass in featureClassesToAdd)
            {
                topology.AddClass(featureClass, 1, 1, 1, false);
                AddTopologyRule(topology, esriTopologyRuleType.esriTRTAreaNoGaps, "noGappage", featureClass);
            }

            //if (validateNow)
            //{
            //    IPolygon
            //}
        }

        public static void AddTopologyRule(ITopology topology, esriTopologyRuleType ruleType, string ruleName, IFeatureClass featureClass)
        {
            ITopologyRule topologyRule = new TopologyRuleClass();
            topologyRule.TopologyRuleType = ruleType;
            topologyRule.Name = ruleName;
            topologyRule.OriginClassID = featureClass.FeatureClassID;
            topologyRule.AllOriginSubtypes = true;

            ITopologyRuleContainer topologyRuleContainer = topology as ITopologyRuleContainer;
            if (topologyRuleContainer.get_CanAddRule(topologyRule))
            {
                topologyRuleContainer.AddRule(topologyRule);
            }
            else
            {
                throw  new ArgumentException("Could not add the specified feature class to the topology!");
            }
        }

        public static IPolygon getTopologyHandle(ITopology topology)
        {
            IGeoDataset geoDataset = topology as IGeoDataset;
            
            ISegmentCollection location = new PolygonClass();
            location.SetRectangle(geoDataset.Extent);
            IPolygon dirtyPoly = location as IPolygon;

            return dirtyPoly;
        }

        public static void ValidateTopology(ITopology topology)
        {
            try
            {
                IEnvelope env = new EnvelopeClass();
                env.XMin = -39.9999999999999;
                env.YMax = 45.0000000000001;
                env.XMax = 11.9983333330001;
                env.YMin = -11.9999999999999;

                Console.WriteLine("Validating topology");
                try
                {
                    topology.ValidateTopology(env);
                }
                catch (System.AccessViolationException ex)
                {
                    Console.WriteLine("Access Violation error:\n\t" + ex.StackTrace);
                }
                
                Console.WriteLine("Done validating");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                if (ex.InnerException != null)
                    Console.WriteLine(ex.InnerException.Message);
            }
        }
    }
}
