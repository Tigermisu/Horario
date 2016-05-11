using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Horario.Models.Entities;

namespace Horario.Models.Repositories
{
    public class DicaRepository
    {
        private miSisicidiDBEntities context = new miSisicidiDBEntities();

        public IEnumerable<Dica> Dicas
        {
            get { return context.Dicas; }
        }

        public void registerHorario(string nomina, string dia, string inicio, string duracion, string fc = null) {
            Horario_Ocupado ho = new Horario_Ocupado();
            ho.Nomina = nomina;
            ho.Hora_Inicio = inicio;
            ho.Duracion = duracion;
            ho.Dia = dia;
            if (fc != null) { 
                ho.Fecha_Caducidad = Byte.Parse(fc);
            }
            context.Horario_Ocupado.Add(ho);
            context.SaveChanges();
        }
    }
}