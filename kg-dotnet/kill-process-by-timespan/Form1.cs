using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Speech.Synthesis;
using System.Threading;


namespace RobloxKill
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
            
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            /* https://msdn.microsoft.com/en-us/library/system.speech.synthesis.speechsynthesizer */
            SpeechSynthesizer synth = new SpeechSynthesizer();
            synth.SpeakAsync("Hello there. You have been playing row blocks way too long.  Time to study.");

        }
    }
}
