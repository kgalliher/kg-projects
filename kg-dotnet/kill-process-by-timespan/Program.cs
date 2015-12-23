using System;
using System.Windows.Forms;
using System.Diagnostics;

namespace RobloxKill
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            DateTime now = DateTime.Now;
            Process[] localByName = Process.GetProcessesByName("RobloxPlayerBeta");
            if(localByName.Length > 0)
            {
                foreach (var prc in localByName)
                {
                    DateTime strtTime = prc.StartTime;

                    if (now.TimeOfDay.Hours - strtTime.TimeOfDay.Hours > 2)
                    {
                        prc.Kill();
                        Application.EnableVisualStyles();
                        Application.SetCompatibleTextRenderingDefault(false);
                        Application.Run(new Form1());
                    }
                }
            }         
        }
    }
}
