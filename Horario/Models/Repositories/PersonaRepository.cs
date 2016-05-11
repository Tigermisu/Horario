using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Horario.Models.Entities;

namespace Horario.Models.Repositories
{
    public class PersonaRepository
    {
        private miSisicidiDBEntities context = new miSisicidiDBEntities();

        public IEnumerable<Persona> Personas
        {
            get { return context.Personas; }
        }

        public void SavePersona(Persona persona)
        {
            context.Personas.Add(persona);
            context.SaveChanges();
        }
    }
}