using System;

namespace CodeIndex
{
    class Program
    {
        static void Main(string[] args)
        {
            try
            {
                var indexer = new CodeIndexer();
                indexer.DoIndexing(args);

                Console.WriteLine("");
                //Console.ReadLine();
            } 
            catch (Exception exc)
            {
                Console.WriteLine(exc.ToString());    
            }
            
        }

    }
}
