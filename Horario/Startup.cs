using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Horario.Startup))]
namespace Horario
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {

        }
    }
}
