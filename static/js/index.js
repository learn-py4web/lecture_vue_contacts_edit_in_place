// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};


// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        add_mode: false,
        add_first_name: "",
        add_last_name: "",
        rows: [],
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    app.decorate = (a) => {
        a.map((e) => {
            e._state = {first_name: "clean", last_name: "clean"};
            e._server_vals = {first_name: e.first_name, last_name: e.last_name};
        });
        return a;
    };

    app.add_contact = function () {
        axios.post(add_contact_url,
            {
                first_name: app.vue.add_first_name,
                last_name: app.vue.add_last_name,
                _state: {first_name: "clean", last_name: "clean"},
            }).then(function (response) {
            app.vue.rows.push({
                id: response.data.id,
                first_name: app.vue.add_first_name,
                last_name: app.vue.add_last_name,
                _state: {first_name: "clean", last_name: "clean"},
                _server_vals: {
                    first_name: app.vue.add_first_name,
                    last_name: app.vue.add_last_name
                }
            });
            app.enumerate(app.vue.rows);
            app.reset_form();
            app.set_add_status(false);
        });
    };

    app.reset_form = function () {
        app.vue.add_first_name = "";
        app.vue.add_last_name = "";
    };

    app.delete_contact = function(row_idx) {
        let id = app.vue.rows[row_idx].id;
        axios.get(delete_contact_url, {params: {id: id}}).then(function (response) {
            for (let i = 0; i < app.vue.rows.length; i++) {
                if (app.vue.rows[i].id === id) {
                    app.vue.rows.splice(i, 1);
                    app.enumerate(app.vue.rows);
                    break;
                }
            }
            });
    };

    app.set_add_status = function (new_status) {
        app.vue.add_mode = new_status;
    };

    app.start_edit = function (row_idx, fn) {
        app.vue.rows[row_idx]._state[fn] = "edit";
    };

    app.stop_edit = function (row_idx, fn) {
        let row = app.vue.rows[row_idx];
        if (row._state[fn] === 'edit') {
            if (row._server_vals[fn] !== row[fn]) {
                row._state[fn] = "pending";
                axios.post(edit_contact_url, {
                    id: row.id, field: fn, value: row[fn]
                }).then(function (result) {
                    row._state[fn] = "clean";
                    row._server_vals[fn] = row[fn];
                })
            } else {
                row._state[fn] = "clean";
            }
        }
    };

    // We form the dictionary of all methods, so we can assign them
    // to the Vue app in a single blow.
    app.methods = {
        add_contact: app.add_contact,
        set_add_status: app.set_add_status,
        delete_contact: app.delete_contact,
        start_edit: app.start_edit,
        stop_edit: app.stop_edit,
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    // And this initializes it.
    // Generally, this will be a network call to the server to
    // load the data.
    // For the moment, we 'load' the data from a string.
    app.init = () => {
        axios.get(load_contacts_url).then(function (response) {
            app.vue.rows = app.decorate(app.enumerate(response.data.rows));
        });
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);
