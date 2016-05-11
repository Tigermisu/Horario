$(function () {
    app.bindEvents();
});

var app = {
    DAYS: {
        "l": "Lunes",
        "m": "Martes",
        "x": "Miércoles",
        "j": "Jueves",
        "v": "Viernes"
    },

    DAYSNUM: {
        "0": "d",
        "1": "l",
        "2": "m",
        "3": "x",
        "4": "j",
        "5": "v",
        "6": "s"
    },

    bindEvents: function () {
        $('#dicaname').change(function () {
            var dicaNomina = $(this).val();
            $('#horario-pager li').unbind('.paginationEvent');
            if (dicaNomina != "null") {
                getDicaHorario(dicaNomina, 0);
            } else {
                $('#horario-wrapper').slideUp();
            }
        });

        $('.horario-grid').on('touchmove', function (e) {
            e.preventDefault();
        });

        $('#email').change(function () {
            var userEmail = $(this).val();
            if (userEmail.match(/^[Aa]\d{8}/) != null) {
                if (userEmail.match(/^[Aa]\d{8}$/) != null) userEmail += '@itesm.mx';
                $('#email').val(userEmail);
                $('#nombre').prop("readonly", true).addClass('disabled');
                $('#apellido').prop("readonly", true).addClass('disabled');
                //$('#celular').prop("readonly", true).addClass('disabled');
                getUserDetails(userEmail, true);
            } else {
                $('#nombre').prop("readonly", false).removeClass('disabled');
                $('#apellido').prop("readonly", false).removeClass('disabled');
                $('#celular').prop("readonly", false).removeClass('disabled');
                getUserDetails(userEmail, false);
            };
        });

        $('.horario-grid').not('.occupied').on('mousedown touchstart', function () {
            if ($(this).hasClass('occupied')) return false;
            var clickedGrid = $(this),
                clickedDay = clickedGrid.parent(),
                finishSelection = function () {
                    var selectedItems = $('.selected'),
                        startHour = selectedItems.first().index(),
                        startRaw = startHour - 1,
                        day = clickedDay.data('fullday'),
                        duration = (selectedItems.length * 30) + " minutos";
                    startHour = $('.horario-info p').eq(startRaw).text();
                    $('.horario-grid, .horario-day, body').unbind('.selectionEvent');
                    $('#day').val(day).data('day', clickedDay.data('day')).data('timestamp',clickedDay.data('timestamp'));
                    $('#startHour').val(startHour).data('hour', startRaw);
                    $('#duration').val(duration).data('duration', selectedItems.length);
                };
            $('.horario-grid').removeClass('selected');
            clickedGrid.addClass('selected');
            clickedGrid.siblings('.horario-grid').not('.occupied').one('mouseover.selectionEvent', function () {
                app.markSelected($(this));
            });
            clickedGrid.parent().on('touchmove.selectionEvent', function (e) {
                var touch = e.originalEvent.touches[0],
                    x = touch.clientX,
                    y = touch.clientY,
                    el = $(document.elementFromPoint(x, y));
                if (el.hasClass('horario-grid') && !el.hasClass('occupied') && el.parent().data('day') == clickedDay.data('day')) {
                    app.markSelected(el);
                } else {
                    finishSelection();
                }
            });
            clickedGrid.siblings('.occupied').one('mouseover.selectionEvent', finishSelection);
            $('body').one('mouseup.selectionEvent', finishSelection);
            $('body').one('touchend.selectionEvent', finishSelection);
            $('.horario-day').not(clickedDay).one('mouseover.selectionEvent', finishSelection);
        });

        $('#createCita').submit(function (e) {
            e.preventDefault();
            //string inicio, string duracion
            var formData = {correo: $('#email').val(),
                nombre: $('#nombre').val(),
                apellido: $('#apellido').val(),
                celular: $('#celular').val(),
                nomina: $('#dicaname').val(),
                descripcion: $('#description').val(),
                dia: $('#day').data('day'),
                inicio: $('#startHour').data('hour') + "",
                duracion: $('#duration').data('duration') + "",
                weekoffset: $('#horario-wrapper').data('offset')
            }
            if (typeof formData.dia == "undefined" || $('#day').val() == "") {
                alertify.alert("Por favor selecciona un horario para tu cita.");
            } else {
                timestamp = $('#day').data('timestamp');
                timestamp = new Date(timestamp);
                timestamp.setHours(9 + Math.floor(parseInt(formData.inicio) / 2), 30 * (parseInt(formData.inicio) % 2), 0, 0);
                if (timestamp < Date.now()) {
                    alertify.alert("Lo sentimos, no es posible crear citas en el pasado.");
                } else {
                    createCita(formData);
                }
            }



        });
    },

    scroll: function(elem) {
        $('html, body').animate({
            scrollTop: $(elem).offset().top - 100
        }, 300);
    },

    markSelected: function($elem) {
        var elemIndex = $elem.index() - 1,
            $siblings = $elem.parent().children('.horario-grid'),
            hasSelectedParents = function (startIndex) {
                while (startIndex >= 0) {
                    if ($siblings.eq(startIndex--).hasClass('selected')) return true;                    
                }
                return false;
        }
        if (elemIndex == 0) $elem.addClass('selected');
        else if (hasSelectedParents(elemIndex - 1)) {
            while (!$siblings.eq(elemIndex).hasClass('selected')) $siblings.eq(elemIndex--).addClass('selected');
        } else {
            while (!$siblings.eq(elemIndex).hasClass('selected')) $siblings.eq(elemIndex++).addClass('selected');
        }
    },

    populateHorario: function (horarioData, weekoffset) {
        app.setHorarioPagination(weekoffset);
        $('.horario-grid').removeClass('selected').not('.recurrent').removeClass('occupied');
        if (weekoffset == "0") $('.horario-grid').removeClass('occupied recurrent');
        $('#day').val('');
        $('#startHour').val('');
        $('#duration').val('');
        for (var i in horarioData) {
            var h = horarioData[i];
            var $day = $('[data-day=' + h.Dia + ']');
            for (var j = parseInt(h.Hora_Inicio), l = parseInt(h.Hora_Inicio) + parseInt(h.Duracion) ; j < l; j++) {
                var $thisHorario = $day.find('.horario-grid').eq(j);
                $thisHorario.addClass('occupied');
                if (h.Fecha_Caducidad === null) $thisHorario.addClass('recurrent');
                
            }
        }
    },

    setHorarioPagination: function (weekoffset) {
        app.setHorarioHeaders(weekoffset);
        var selectedDica = $('#dicaname').val();
        $('#next').one('click.paginationEvent', function () {
            $('#horario-pager li').unbind('.paginationEvent');
            getDicaHorario(selectedDica, weekoffset + 1);
        });
        if (weekoffset == 0) {
            $('#prev').addClass('disabled');
        } else {
            $('#prev').removeClass('disabled');
            $('#prev').one('click.paginationEvent', function () {
                $('#horario-pager li').unbind('.paginationEvent');
                getDicaHorario(selectedDica, weekoffset - 1);
            });
        }
        
    },

    setHorarioHeaders: function (weekoffset) {
        $('#horario-wrapper').data('offset', weekoffset);
        var today = new Date(Date.now()).getDay(),
            MILIS = 24 * 60 * 60 * 1000;
        for (var i = 1; i <= 5; i++) {
            var $dayHeader = $('[data-day=' + app.DAYSNUM[i] + '] h3'),
                targetDate = new Date(Date.now() - MILIS * (today - i) + (parseInt(weekoffset) * 7 * MILIS)),
                fullDay = app.DAYS[app.DAYSNUM[i]] + " " + targetDate.getDate() + "/" + (targetDate.getMonth() + 1);
            $dayHeader.parent().data('fullday', fullDay);
            $dayHeader.parent().data('timestamp', targetDate);
            $dayHeader.html(fullDay);
        }
    }



}