using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Horario.Models.Entities;

namespace Horario.Models.Repositories
{
    public class CitaRepository
    {
        private miSisicidiDBEntities context = new miSisicidiDBEntities();

        public IEnumerable<Cita> Citas
        {
            get { return context.Citas; }
        }

        public void SaveCita(Cita cita) {
            context.Citas.Add(cita);
            context.SaveChanges();
        }
    }
}