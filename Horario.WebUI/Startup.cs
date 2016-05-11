using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Horario.WebUI.Startup))]
namespace Horario.WebUI
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
