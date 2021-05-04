

$(document).ready(function(){

    const vinValidate = (vin) => {
        const vinErr = document.querySelector('.vin-error')
        vinErr.innerText = ''
        if (!vin.match(/^[0-9a-z]+$/i) || vin.length !== 17){
            vinErr.innerText = 'Please enter valid vin number (17 alphanumeric characters)'
            return false
        }
        return true
    }

    const ymmValidate = (year, make, model) => {
        const yrErr = document.getElementById('yr-error')
        const mkErr = document.getElementById('mk-error')
        const mdErr = document.getElementById('md-error')
        yrErr.innerText = ''
        mkErr.innerText = ''
        mdErr.innerText = ''

        let isValid = true
        
        if (!year.match(/^[0-9]+$/) || year < 1981 || year > new Date().getFullYear() + 1 || year.length !== 4){
            yrErr.innerText = 'Please enter valid year (from 1981 to current)'
            isValid = false
        }

        if (!make.match(/^([a-z-]+)$/i) || make.length === 0){
            mkErr.innerText = 'Please enter valid make'
            isValid = false
        }

        if (!model.match(/^([a-z0-9-]+)$/i)){
            mdErr.innerText = 'Please enter valid model'
            isValid = false
        }

        return isValid

    }

    // insert a row in my vehicle list when added a car
    function carRow(id){
        var row = (`<div class="row justify-content-around mt-4" id="id-${id}"> 
            <div class="col-5"><a href="/my-cars/${id}">
            <button type="submit" class="car-btn w-100 btn-${id}" id="btn-${id}"></button></a></div>
            <div class="col-5"><a href="" class="rm-link" id="rm-link-${id}" name="">
            <button class="car-btn w-100" type="button" data-toggle="modal" data-target="#rm-modal">
            <i class="fas fa-times-circle fa-lg mr-2"></i> REMOVE VEHICLE
            </button></a></div></div>`)

        return row
    }

    function vinDecodeAjax(vin){
        let vinDecode = {
            "async": true,
            "crossDomain": true,
            "url": '/test-data/'+vin,
            // "url": "https://vin-decoder7.p.rapidapi.com/vin?vin="+vin,
            "method": "GET",
            // "headers": {
            //     "x-rapidapi-key": vinDecodeAPI,
            //     "x-rapidapi-host": "vin-decoder7.p.rapidapi.com"
            // },
            contentType: "application/json; charset=utf-8",
        };
        return vinDecode
    }
    

    $('#search').on('click', function(e){
        e.preventDefault()
        let vin = $('#vin-num').val().trim()
        vinValidate(vin)
        if (vinValidate(vin)){
            $.ajax(vinDecodeAjax(vin)).done(function(response){
            let year = response.specifications.year
            let make = response.specifications.make
            let model = response.specifications.model
            // console.log(make + response.specifications.vin)

            $('#vin-label').html(
                `<h5>Is this your car?</h5> <p>${year} ${make} ${model}</p>`
            )
            $('#not-this').text('No')
            $('#search').hide()
            $('#yes').show()
            
            // .off().on() resolves the row gets appended twice
            $('#yes').off().on('click', function(e){
                e.preventDefault()
                vin = $('#vin-num').val().trim()
                vinValidate(vin)
                console.log('submitting data')
                
                if (vinValidate(vin)){
                    $('#vin-modal').modal('hide')
                    $.ajax({
                        type: 'POST',
                        url: '/my-cars/add',
                        data: {
                            'by-vin': 'by-vin',
                            'res-data': JSON.stringify(response),
                            csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
                        },
                        success: function(result){addCarSuccess(result, year, make, model)}
                    })
                }
            })
            })
        }
        
    })

    $('#vin-modal').on('hidden.bs.modal', function(e) {
        $('#vin-modal form')[0].reset();
        $('#vin-error').empty()
        $('#vin-label').text('VIN')
        $('#not-this').text('Cancel')
        $('#search').show()
        $('#yes').hide()
    });

    $('#ymm-form').on('submit', function(e){
        e.preventDefault()
        console.log('adding ymm')
        let year = $('#add-year').val().trim()
        let make = $('#add-make').val().trim()
        let model = $('#add-model').val().trim()
        
        ymmValidate(year, make, model)

        if (ymmValidate(year, make, model)){
            $('#ymm-modal').modal('hide')
            $.ajax({
                type: 'POST',
                url: '/my-cars/add',
                data: {
                    'by-ymm':'by-ymm',
                    'year': year,
                    'make': make,
                    'model': model,
                    csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
                },
                success: function(result){
                    addCarSuccess(result, year, make, model)
                }
            })
        }
        
    })

    $('#ymm-modal').on('hidden.bs.modal', function(e) {
        $('#ymm-modal form')[0].reset();
        $('#yr-error').empty()
        $('#mk-error').empty()
        $('#md-error').empty()
    });


    function addCarSuccess(result, year, make, model){
        id = result.car_id
        addRow = carRow(id)
        $('#car-list').append(addRow)
        $('#btn-'+id).text(`${year} ${make} ${model}`)
        $('#rm-link-'+id).attr('name', id)                            
        $(`a[id="rm-link-${id}"]`).on('click', assignRmId)
    }


    $('a[class="rm-link"]').on('click', assignRmId)


    function assignRmId(e){
        e.preventDefault()
        $('#rm-modal').modal('show')
        // change 'carId' to 'Id'
        var Id = $(this).attr('name')
        // change '#rm-car-id' to '#rm-target-id'
        $('#rm-target-id').val(Id)
    }


    $('#del-form').on('submit', delCar)


    function delCar(e){
        e.preventDefault()
        var thisCarID = $('#rm-target-id').val()
        $('#rm-modal').modal('hide')

        $.ajax({
            type: 'GET',
            url: `my-cars/delete/${thisCarID}`,
            success: function(response){
                if (response['success']){
                    $('#del-success').show()
                    $('#del-success').html(response['success']).fadeOut(5000)
                    $('#id-'+thisCarID).remove()
                }
                else {
                    $('#del-fail').html('An error has occured, please try again!')
                }
            }

        })
    }

    $('#add-vin-fm').on('submit', function(e){
        e.preventDefault()
        let get_id = $('#car_id').val()
        vin = $('#vin-input').val().trim()
        let get_yr = $('.get_yr').html()
        let get_make = $('.get_make').html()
        let get_model = $('.get_model').html()

        vinValidate(vin)

        if (vinValidate(vin)){
            $.ajax(vinDecodeAjax(vin)).done(function(response){
                if (response.specifications.year == get_yr && response.specifications.make == get_make &&
                    response.specifications.model == get_model){
                    $.ajax({
                        type: 'POST',
                        url: '/my-cars/edit/'+get_id,
                        data: {
                            'res-data': JSON.stringify(response),
                            csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
                        },
                        success: function(result){
                            if (result.success){
                                $('.get_trim').html(result.success.trim)
                                $('.get_engine').html(result.success.engine)
                                $('.get_transmission').html(result.success.trans)
                                $('#vin-row').html(`<p class="text-muted">VIN: ${vin}</p>`)
                                $('#vin-modal').val(vin)
                                $('#engine').val(result.success.engine)
                                $('#trim').val(result.success.trim)
                                $('#transmission').val(result.success.trans)
                            }
                            
                        }
                    })        
                } 
                else {
                    console.log('different car')
                    $('#cf-car-modal').modal('show')
                    $('#cf-car-modal .modal-body').append(
                        `<p id="found-car-info" class="font-weight-bold"> ${response.specifications.year} ${response.specifications.make}
                        ${response.specifications.model} ${response.specifications.trim}</p>`
                    )
                    $('#confirm-form').on('submit', function(e){
                        e.preventDefault()
                        $.ajax({
                            type: 'POST',
                            url: '/my-cars/edit/'+get_id,
                            data: {
                            'res-data': JSON.stringify(response),
                            csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
                            },
                            success: function(res){
                                if (res.success){
                                    window.location.href = '/my-cars/'+get_id
                                }
                            }
                        })
                    })
                }
            })

        }

    })

    $('#cf-car-modal').on('hidden.bs.modal', function(e) {
        $('#found-car-info').remove();
    });

    let get_make = $('.get_make').text().replace(/\s+/g, '')
    let get_model = $('.get_model').text().replace(/\s+/g, '')
    let get_yr = $('.get_yr').text()
    let get_odometer = $('.get_odometer').text()
    let curr_yr = new Date().getFullYear()

    $('a[href="#nav-recall"]').on('click', function(){

        $.ajax({
            method: "GET",
            url: `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${get_make}&model=${get_model}&modelYear=${get_yr}`,
            dataType: "json",
        }).done(function(response){
            
            if (!$('#nav-recall h5').html()){

                if (response.Count === 0){
                    $('#nav-recall').append('<h5 class="text-center text-success mt-5"> NO RECALLS FOUND!</h5>')
                } else {
                    $('#nav-recall').prepend(`<h5 class="text-danger my-4"> Total Recalls: ${response.Count}</h5>`)
                    for (var contents of response.results){
                        $('#accordion').append(
                        `<div class="card"><div class="card-header" id="heading${contents.NHTSACampaignNumber}">
                        <p class="mb-0 text-danger" data-target="#${contents.NHTSACampaignNumber}" aria-expanded="false" aria-controls="${contents.NHTSACampaignNumber}">
                        NHTSA Campaign Number: ${contents.NHTSACampaignNumber} / Report Date: ${contents.ReportReceivedDate}
                        </p></div>
                        <div id="${contents.NHTSACampaignNumber}" class="collapse show" aria-labelledby="heading${contents.NHTSACampaignNumber}" data-parent="#accordion">
                        <div class="card-body"><table class="table table-bordered table-hover">
                        <tr><td>Component </td><td>${contents.Component}</td></tr>
                        <tr><td>Summary</td><td>${contents.Summary}</td></tr>
                        <tr><td>Consequence</td><td>${contents.Conequence}</td></tr>
                        <tr><td>Remedy</td><td>${contents.Remedy}</td></tr>
                        <tr><td>Notes</td><td>${contents.Notes}</td></tr>
                        </table></div></div></div>`)
                    }
                }

            }
            
        })    
    })

    $('a[href="#nav-warranty"]').on('click', function(){
        $.ajax({
            type: 'GET',
            url: '/my-cars/warranty'
        }).done(function(response){
            let basic_yr = response.data[0].max_year
            let basic_mi = response.data[0].max_miles
            let powertrain_yr = response.data[3].max_year
            let powertrain_mi = response.data[3].max_miles
           
            if (get_odometer == "0"){
                console.log('odometer is zero')
                $('#nav-warranty').html('<h5 class="text-center text-danger mt-5"> You must set an odometer to check warranty status!</h5>')

            } else {
                
                if ($('i', '#basic-warranty').length == 0 ){

                    if (parseInt(get_yr) + basic_yr < curr_yr || get_odometer > basic_mi){
                        $('#basic-warranty').prepend('<i class="fas fa-times-circle fa-3x text-danger d-block text-center expired"></i>')
                    } else {$('#basic-warranty').prepend('<i class="fas fa-check-circle fa-3x text-success d-block text-center valid"></i>')}
                    
                    if (parseInt(get_yr) + powertrain_yr < curr_yr || get_odometer > powertrain_mi){
                        $('#powertrain').prepend('<i class="fas fa-times-circle fa-3x text-danger d-block text-center expired"></i>')
                    } else {$('#powertrain').prepend('<i class="fas fa-check-circle fa-3x text-success d-block text-center valid"></i>')}
        
                    if ($('#basic-warranty i').hasClass('expired') && $('#powertrain i').hasClass('expired')){
                        $('#warranty-status').prepend('<i class="fas fa-times-circle fa-4x text-danger d-block text-center"></i>')
                        $('#warranty-status p').append('All warranties have expired.')
                    }else if ($('#basic-warranty i').hasClass('expired')){
                        $('#warranty-status').prepend(
                            `<span class="material-icons md-60 text-center text-warning d-block">
                            do_not_disturb_on</span>`
                            )
                        $('#warranty-status p').append('The basic warranty have expired.')
                    }else {
                        $('#warranty-status').prepend('<i class="fas fa-check-circle fa-4x text-success d-block text-center"></i>')
                        $('#warranty-status p').append('All warranties are valid.')
                    }
    
                }

            }
        })
    })


    $('a[href="#nav-maint"]').click(function(){
        console.log('services')
        let interval = 0, services = ''

        if (isNaN(get_odometer)){
            $('#nav-maint').html('<h5 class="text-center text-danger mt-5"> You must set an odometer to check service schedules!</h5>')
        } else {
            if (!$('#nav-maint table').html()){
                for (let i = 7500; i <= 120000; i+=7500){
                    if (i === 7500 || i === 22500 || i === 37500 || i === 52500 ||
                        i === 67500 || i === 82500 || i === 97500 || i === 112500) {
                        interval = i
                        services = 'All items in Group A'
                        maintBlock(interval, services);
                    } else if (i === 15000 || i === 45000 || i === 75000 || i === 105000 ) {
                        interval = i
                        services = 'All items in Group A and B'
                        maintBlock(interval, services);
                    } else if (i === 30000 || i === 60000 || i === 90000 || i === 120000) {
                        interval = i
                        services = 'All items in Group A, B and C'
                        maintBlock(interval, services);
                    }
                    
                }
            }

        }

    })
    

    function maintBlock(interval, services){
        let month = interval/7500 * 6
        let tabName = `${interval}-mile / ${month}-month`
        
        $('#nav-maint table').append(
            `<tr>
                <th class="w-25">${tabName}</th>
                <td class="w-75 ${interval}-mi">${services}</td>
            </tr>`
        )
        if (interval === 30000){
            $('.'+interval+'-mi').append(' plus check valve clearance')
        } 
        if (interval === 45000){
            $('.'+interval+'-mi').append(' plus replace coolant and brake fluid')
        } 
        if (interval === 75000){
            $('.'+interval+'-mi').append(' plus replace coolant')
        }
        if (interval === 90000){
            $('.'+interval+'-mi').append(' plus replace brake fluid, replace transmission fluid')
        } 
        if (interval === 105000){
            $('.'+interval+'-mi').append(' plus replace coolant/timing belt, inspect water pump, check idle speed')
        }


    }
   
    $('#add-records-fm').on('submit', function(e){
        e.preventDefault()
        const service_data = new FormData(document.getElementById("add-records-fm"))
        const carID = service_data.get('car_id')
        const image = document.getElementById('id_service_receipt')
        const img_data = image.files[0]
        // let img_url;
        let url;
        if (img_data){
            // img_url = URL.createObjectURL(img_data)
            url = URL.createObjectURL(img_data)

        } else {
            // img_url = 'https://django-the-carage.s3.amazonaws.com/invoice_receipt.png'
            url = 'https://django-the-carage.s3.amazonaws.com/invoice_receipt.png'
        }

        // url = img_url
        
        $('#addServiceModal').modal('hide')

        $.ajax({
            type: 'POST',
            url: carID+'/add-service',
            data: service_data,
            cache: false,
            enctype: 'multipart/form-data',
            processData: false,
            contentType: false,
        }).done(function(res){addServiceSuccess(res, url)})

    })


    function ServiceRow(res, url){
        row = `<div id="record${res.pk}"><div class="card">
        <div class="card-header" id="headingService${res.pk}"><h5 class="mb-0">
        <button class="btn btn-link" data-toggle="collapse" data-target="#collapseService${res.pk}" aria-controls="collapseService${res.pk}">
        <i class="fas fa-bars mr-2 text-dark"></i> ${res.title} | ${res.service_date}</button>
        <a href="edit-record-link" class="mr-2" name="${res.pk}"><i class="fas fa-pencil-alt fa-sm text-dark"></i></a>
        <a href="" id="del-record-${res.pk}" name=""><i class="fas fa-trash-alt fa-sm text-danger"></i></a>
        </h5></div><div id="collapseService${res.pk}" class="collapse" aria-labelledby="headingService${res.pk}" data-parent="#record${res.pk}">
        <div class="card-body"><table class="table">
        <tr><td>Description</td><td>${res.description}</td></tr>
        <tr><td>Location</td><td>${res.location}</td></tr>
        <tr><td>Odometer</td><td>${res.odometer}</td></tr>
        <tr><td>Receipt</td><td><a href="${url}" target="_blank">
        <img src="${url}" alt="Service Receipt" style="max-height:150px; width:60%"></a></td></tr>
        </table></div></div></div></div>`
        return row
    }

    function recordHeadings(type){
        fstLetterUpper = type[0].toUpperCase() + type.slice(1)
        heading = `<h5 class="mr-3 d-inline-block">${fstLetterUpper} Records</h5>
        <a href="" data-toggle="modal" data-target='#addServiceModal'><i class="fas fa-plus fa-lg text-success"></i></a>`
        return heading
    }

    $('#addServiceModal').on('hidden.bs.modal', function(e) {
        $('#addServiceModal form')[0].reset();
    })

    function addServiceSuccess(res, url){
        addRow = ServiceRow(res, url)
        if (res.car_all_records === 1){
            $('#nav-service').html(`<div id="all-records" class="row">
                <div id='services' class="col-6"></div><div id='repairs' class="col-6"></div></div>`)
        }
        if (res.work_type === 'service'){  
            if (res.car_svc_record === 1){
                $('#services').prepend(recordHeadings(res.work_type))
            } 
            $('#services').append(addRow)
            
        } else if (res.work_type === 'repair'){
            if (res.car_repair_record === 1){
                $('#repairs').prepend(recordHeadings(res.work_type))
            }

            $('#repairs').append(addRow)
        }
        $('#del-record-'+res.pk).attr('name', res.pk)                          
        $(`a[id="del-record-${res.pk}"]`).on('click', assignRmId)
        $('a[href="edit-record-link"]').on('click', editRecord)
    }


    $('#del-record-form').on('submit', delRecord)


    function delRecord(e){
        e.preventDefault()
        const thisRecordID = $('#rm-target-id').val()
        $('#rm-modal').modal('hide')

        $.ajax({
            type: 'GET',
            url: `service/${thisRecordID}/delete`,
            success: function(response){
                if (response['success']){
                    $('#del-success').show()
                    $('#del-success').html(response['success']).fadeOut(5000)
                    $('#record'+thisRecordID).remove()
                }
                else {
                    $('#del-fail').html('An error has occured, please try again!')
                }
            }

        })
    }

    function editRecord(e){
        e.preventDefault()
        const recordID = $(this).attr('name')
        $.ajax({
            type: 'GET',
            url: "get-service-info/"+recordID,
        }).done(function(response){

            $('#editRecordModal').modal('show')
            $('#edit-record-form').attr('action', '/my-cars/service/edit/'+response[0].pk)
            $(`#edit-record-form option[value=${response[0].fields.work_type}]`).attr('selected', 'selected')
            $('#edit-record-form input[name="title"]').val(response[0].fields.title)
            $('#edit-record-form textarea[name="description"]').val(response[0].fields.description)
            $('#edit-record-form input[name="service_date"]').val(response[0].fields.service_date)
            $('#edit-record-form input[name="location"]').val(response[0].fields.location)
            $('#edit-record-form input[name="odometer"]').val(response[0].fields.odometer)

        })
    }

    $('a[href="edit-record-link"]').on('click', editRecord)

    $('#search-location').click(displayMapInfo)
    function displayMapInfo(e){
        e.preventDefault();
        var locationInput = document.getElementById('location-input').value
        var searchContent = document.getElementById('search-content').value

        axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: locationInput,
                key: googleMapAPI,
            }
        })
        .then(function(response){

            let Lat = response.data.results[0].geometry.location.lat
            let Lng = response.data.results[0].geometry.location.lng
            let locationLatLng = new google.maps.LatLng(Lat, Lng)
            
            initMap(locationLatLng, searchContent)
            
        })
        .catch(function(error){
            console.log(error)
        })
    }

})


function initMap(location, searchContent) {

    let map = new google.maps.Map(document.getElementById('map'),{
        center: location,
        zoom: 12,
    })

    let infowindow = new google.maps.InfoWindow();

    let request = {
        location: location,
        radius: 500,
        query: searchContent,
        type: ['car-repair']
    }

    let service = new google.maps.places.PlacesService(map);
    service.textSearch(request, callback)

    function callback(results, status){
        
        if (status == google.maps.places.PlacesServiceStatus.OK){
            
            $('#page-nums').html(`<ul class="nav nav-pills" id="pills-tab" role="tablist"><li class="nav-item">
                <a class="nav-link active" id="pills-one-tab" data-toggle="pill" href="#page-one" role="tab" aria-controls="page-one" aria-selected="true">Page 1</a>
                </li><li class="nav-item">
                <a class="nav-link" id="pills-two-tab" data-toggle="pill" href="#page-two" role="tab" aria-controls="page-two" aria-selected="false">Page 2</a>
                </li><li class="nav-item">
                <a class="nav-link" id="pills-three-tab" data-toggle="pill" href="#page-three" role="tab" aria-controls="page-three" aria-selected="false">Page 3</a>
                </li></ul>`)
            
            $('#place-results').html(`<div class="tab-content" id="pills-tabContent">
                <div class="tab-pane fade show active" id="page-one" role="tabpanel" aria-labelledby="pills-one-tab">
                <ul class="list-group list-group-flush bg-transparent" id="pg-one"></ul></div>
                <div class="tab-pane fade" id="page-two" role="tabpanel" aria-labelledby="pills-two-tab">
                <ul class="list-group list-group-flush bg-transparent" id="pg-two"></ul></div>
                <div class="tab-pane fade" id="page-three" role="tabpanel" aria-labelledby="pills-three-tab">
                <ul class="list-group list-group-flush bg-transparent" id="pg-three"></ul></div></div>`)
            
            for (var i = 0; i < results.length; i++) {
                var place = results[i];
                var placeAddress = place.formatted_address.replace(', United States', '')
                var placeRow = `<li class="list-group-item bg-transparent each-place">
                                <strong>${place.name}</strong><br>${placeAddress}</li>`
                if (place.formatted_address.match(/,/g).length > 2){
                    if (i <= 7){
                        $('#pg-one').append(placeRow)
                    } else if (i > 7 && i <=14) {
                        $('#pg-two').append(placeRow)
                    } else {
                        $('#pg-three').append(placeRow)
                    }
                    
                    createMarker(place);
                }

            }
        } 
        else {
            console.log(status)
        }

    }

    function createMarker(place){
        if (!place.geometry || !place.geometry.location) return;
        const marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location,
        });
        google.maps.event.addListener(marker, "click", () => {
            infowindow.setContent(`<div><h5>${place.name}</h5>
                                <p>${place.formatted_address}</p></div>`);
            infowindow.open(map, marker);
        });
        
    }
    
   
}


