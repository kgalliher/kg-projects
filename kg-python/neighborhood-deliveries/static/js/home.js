// Create the namespace instance
let ns = {};

// Create the model instance
ns.model = (function() {
    'use strict';

    let $event_pump = $('body');

    // Return the API
    return {
        'read': function() {
            let ajax_options = {
                type: 'GET',
                url: 'api/deliveries',
                accepts: 'application/json',
                dataType: 'json'
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_read_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        create: function(company, myhouse, deliverydate) {
            let ajax_options = {
                type: 'POST',
                url: 'api/deliveries',
                accepts: 'application/json',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                    'Company': company,
                    'MyHouse': myhouse,
                    'Date': deliverydate
                })
            };
            $.ajax(ajax_options)
            .done(function(data) {
                console.log(data)
                $event_pump.trigger('model_create_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        update: function(id, company, myhouse, deliverydate) {
            let ajax_options = {
                type: 'PUT',
                url: 'api/deliveries/' + id,
                accepts: 'application/json',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                    'id': id,
                    'Company': company,
                    'MyHouse': myhouse,
                    'Date': deliverydate
                })
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_update_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        'delete': function(id) {
            let ajax_options = {
                type: 'DELETE',
                url: 'api/deliveries/' + id,
                accepts: 'application/json',
                contentType: 'plain/text'
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_delete_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        }
    };
}());

// Create the view instance
ns.view = (function() {
    'use strict';

    let $id = $("#id"), $company = $('#company'),
        $deliverydate = $('#deliverydate'),
        $myhouse = $('#myhouse');

    // return the API
    return {
        reset: function() {
            $id.val('');
            $company.val('');
            $deliverydate.val('');
            $myhouse.val('');
            $company.val('').focus();
        },
        update_editor: function(id, company, myhouse, deliverydate) {
            $id.val(id);
            $company.val(company);
            $deliverydate.val(deliverydate);
            $myhouse.val(myhouse);
            $company.val(company).focus();
        },
        build_table: function(deliveries) {
            let rows = ''

            // clear the table
            $('.deliveries table > tbody').empty();

            // did we get a deliveries array?
            if (deliveries) {
                for (let i=0, l=deliveries.length; i < l; i++) {
                    rows += `<tr>
                                <td class="id">${deliveries[i].id}</td>
                                <td class="company">${deliveries[i].Company}</td>
                                <td class="myhouse">${deliveries[i].MyHouse}</td>
                                <td class="deliverydate">${deliveries[i].Date}</td>
                            </tr>`;
                }
                $('table > tbody').append(rows);
            }
        },
        error: function(error_msg) {
            $('.error')
                .text(error_msg)
                .css('visibility', 'visible');
            setTimeout(function() {
                $('.error').css('visibility', 'hidden');
            }, 3000)
        }
    };
}());

// Create the controller
ns.controller = (function(m, v) {
    'use strict';

    let model = m,
        view = v,
        $event_pump = $('body'),
        $id = $("#id"),
        $company = $('#company'),
        $myhouse = $('#myhouse'),
        $deliverydate = $("#deliverydate");

    // Get the data from the model after the controller is done initializing
    setTimeout(function() {
        model.read();
    }, 100)

    // Validate input
    function validate(endpoint, deliver_obj) {
        let valid = false;
        switch(endpoint){
            case "create":
                valid = (deliver_obj.company != "" && deliver_obj.myhouse != "");
                break;
            case "update":
                valid = (deliver_obj.id != "" && parseInt(deliver_obj.id) >= 0)
                break;
            case "delete":
                valid = (deliver_obj.id != "" && parseInt(deliver_obj.id) >= 0)
                break
            default:
                return false;
        }

        return valid
    }

    // Create our event handlers
    $('#create').click(function(e) {
        let new_del = {
            "company": $company.val(),
            "myhouse": $myhouse.val(),
            "deliverydate": $deliverydate.val()
        };

        e.preventDefault();

        if (validate("create", new_del)) {
            model.create(new_del.company, new_del.myhouse, new_del.deliverydate)
        } else {
            alert(`Problem with input values - Enter company, My House and Delivery date`);
        }
    });

    $('#update').click(function(e) {
        let update_del = {
            "id": $id.val(),
            "company": $company.val(),
            "myhouse": $myhouse.val(),
            "deliverydate": $deliverydate.val()
        };

        e.preventDefault();

        if (validate("update", update_del)) {
            model.update(parseInt(update_del.id), update_del.company, update_del.myhouse, update_del.deliverydate)
        } else {
            alert(`Problem with input values - All fields are required.  Double click the desired row to update.`);
        }
        e.preventDefault();
    });

    $('#delete').click(function(e) {
        let delete_del = {"id": $id.val()};

        e.preventDefault();

        if (validate('delete', delete_del)) {
            model.delete(delete_del.id)
        } else {
            alert('Problem with ID input.  Add id to Delivery ID input');
        }
        e.preventDefault();
    });

    $('#reset').click(function() {
        view.reset();
    })

    $('table > tbody').on('dblclick', 'tr', function(e) {
        let $target = $(e.target),
            id,
            company,
            myhouse,
            deliverydate;

        id = $target
            .parent()
            .find('td.id')
            .text();

        company = $target
            .parent()
            .find('td.company')
            .text();
        
        myhouse = $target
            .parent()
            .find('td.myhouse')
            .text();
        
        deliverydate = $target
            .parent()
            .find('td.deliverydate')
            .text();
        view.update_editor(id, company, myhouse, deliverydate);
    });

    // Handle the model events
    $event_pump.on('model_read_success', function(e, data) {
        view.build_table(data);
        view.reset();
    });

    $event_pump.on('model_create_success', function(e, data) {
        model.read();
    });

    $event_pump.on('model_update_success', function(e, data) {
        model.read();
    });

    $event_pump.on('model_delete_success', function(e, data) {
        model.read();
    });

    $event_pump.on('model_error', function(e, xhr, textStatus, errorThrown) {
        let error_msg = textStatus + ': ' + errorThrown + ' - ' + xhr.responseJSON.detail;
        view.error(error_msg);
        console.log(error_msg);
    })
}(ns.model, ns.view));
