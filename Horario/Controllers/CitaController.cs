using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using Horario.Models.Entities;
using Horario.Models.Repositories;
using Newtonsoft.Json;

namespace Horario.Controllers
{
    public class CitaController : Controller
    {
        public ActionResult NewCita()
        {
            DicaRepository repo = new DicaRepository();
            return View(repo.Dicas);
        }

        public ActionResult ViewCitas()
        {
            return View();
        }

        public ActionResult GetStudentData(string email)
        {
            PersonaRepository repo = new PersonaRepository();
            Persona persona = repo.Personas.FirstOrDefault(p => p.Correo.ToLower() == email.ToLower());
            var json = JsonConvert.SerializeObject(persona, Formatting.Indented,
                            new JsonSerializerSettings
                            {
                                ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                            });
            return Content(json, "application/json");
        }

        public ActionResult GetDicaHorario(string nomina, string weekoffset)
        {
            DicaRepository repo = new DicaRepository();
            Dica dica = repo.Dicas.FirstOrDefault(d => d.Nomina.ToLower() == nomina.ToLower());
            List<Horario_Ocupado> horarios = dica.Horario_Ocupado.Where(h => h.Fecha_Caducidad == null || h.Fecha_Caducidad.ToString() == weekoffset).ToList();
            if (weekoffset != "0") horarios = horarios.Where(h => h.Fecha_Caducidad.ToString() == weekoffset).ToList();
            foreach (Horario_Ocupado horario in horarios)
            {
                // Remove circular reference so json can be properly made
                horario.Dica = null;
            }
            var json = new JavaScriptSerializer().Serialize(horarios);
            return Content(json, "application/json");
        }

        public ActionResult CreateCita(string correo, string nombre, string apellido, string celular, string nomina, string descripcion, string dia, string inicio, string duracion, string weekoffset) {
            PersonaRepository personaRepo = new PersonaRepository();
            CitaRepository citaRepo = new CitaRepository();
            DicaRepository dicaRepo = new DicaRepository();
            Persona persona = personaRepo.Personas.FirstOrDefault(p => p.Correo.ToLower() == correo.ToLower());
            Dica dica = dicaRepo.Dicas.FirstOrDefault(d => d.Nomina.ToLower() == nomina.ToLower());
            Cita nuevaCita = new Cita();
            if (persona == null) {
                persona = new Persona();
                persona.Nombre = nombre;
                persona.Apellido = apellido;
                persona.Correo = correo;
                persona.Telefono = celular;
                personaRepo.SavePersona(persona);
            }
            nuevaCita.Correo_persona = persona.Correo;
            nuevaCita.Descripcion = descripcion;
            nuevaCita.Nomina = dica.Nomina;
            nuevaCita.Duracion = duracion;
            nuevaCita.Fecha_inicio = getNexWeekDayTimestamp(dia, inicio, weekoffset);
            citaRepo.SaveCita(nuevaCita);
            dicaRepo.registerHorario(dica.Nomina, dia, inicio, duracion, weekoffset);
            return Content("true", "application/json");
        }

        private DateTime getNexWeekDayTimestamp(string dayLetter, string hourNum, string weekOffset) {
            DateTime today = DateTime.Now, targetDate = DateTime.Now;
            today = today.AddDays(Int32.Parse(weekOffset) * 7);
            DayOfWeek targetDay = 0;
            int targetHour = (Int32.Parse(hourNum) / 2) + 9;
            int targetMinutes = (Int32.Parse(hourNum) % 2) == 1 ? 30 : 0;
            switch (dayLetter) {
                case "l": targetDay = DayOfWeek.Monday; break;
                case "m": targetDay = DayOfWeek.Tuesday; break;
                case "x": targetDay = DayOfWeek.Wednesday; break;
                case "j": targetDay = DayOfWeek.Thursday; break;
                case "v": targetDay = DayOfWeek.Friday; break;
            }
            int difference = ((int)targetDay - (int)today.DayOfWeek + 7) % 7;
            targetDate = today.AddDays(difference);
            return new DateTime(targetDate.Year, targetDate.Month, targetDate.Day, targetHour, targetMinutes, 0);
        }

    }
}