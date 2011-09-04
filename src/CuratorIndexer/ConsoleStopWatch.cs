using System;
using System.Diagnostics;

namespace CodeIndex
{
    public class ConsoleStopWatch : IDisposable
    {
        
        private Stopwatch _stopWatch = null;

        public ConsoleStopWatch(string name)
        {
            Name = name;
            _stopWatch = new Stopwatch();
            _stopWatch.Start();

        }

        public string Name { get; set; }

        public void Dispose()
        {
            _stopWatch.Stop();
            Console.WriteLine(DateTime.Now.ToString() + ": " + Name + ": Took {0:0.00} seconds", _stopWatch.Elapsed.TotalSeconds );
        }
    }
}
