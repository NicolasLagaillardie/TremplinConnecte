//--------------------------------------------------------------------------
// URL
//-------------------------------------------------------------------------- 

const serverURL = "http://192.168.12.1:8080/api/";
const getLights = serverURL + "lights/";
const getRooms = serverURL + "rooms/";
const getBuildings = serverURL + "buildings/";

//--------------------------------------------------------------------------
// DOM elements
//--------------------------------------------------------------------------  

let lightsButton;
let roomsButton;
let buildingsButton;
const addButton = document.getElementById("addButton");
const divAddButton = document.getElementById("divAddButton");
const formAddItem = document.getElementById("formAddItem");
const divFormAddItem = document.getElementById("divFormAddItem");

const tableLights = document.getElementById("lights");
const tableRooms = document.getElementById("rooms");
const tableBuildings = document.getElementById("buildings");

//--------------------------------------------------------------------------
// Variables
//-------------------------------------------------------------------------- 

let lastButton;

let isAddLightInitialized = false;
let isAddRoomInitialized = false;
let isAddBuildingInitialized = false;

//--------------------------------------------------------------------------
// MQTT
//--------------------------------------------------------------------------

const client = mqtt.connect("mqtt://192.168.12.1:9001");

function subscribe() {

    // subscribe to some topic
    client.on("connect", function () {
        client.subscribe("/connected", function (err) {
            if (err) {
                console.log(err);
            }
        });
        client.subscribe("/disconnected", function (err) {
            if (err) {
                console.log(err);
            }
        });
    });

    // this will be called when a message is received
    client.on("message", function (topic, payload) {
        const message = new TextDecoder("utf-8").decode(payload);

        const connectedLightPitcure = document.getElementById("img_connected_" + message);
        if (connectedLightPitcure) {
            connectedLightPitcure.src = topic == "/connected" ? "media/connected.svg" : "media/disconnected.svg";
        }

    });

};

//--------------------------------------------------------------------------
// Functions to convert from a base to another
//--------------------------------------------------------------------------   

function hsvToRgb(h, s, v) {
    // Wait for 3 positive floats
    // Returns a triplet of integers

    let r, g, b;

    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0:
            r = v, g = t, b = p;
            break;
        case 1:
            r = q, g = v, b = p;
            break;
        case 2:
            r = p, g = v, b = t;
            break;
        case 3:
            r = p, g = q, b = v;
            break;
        case 4:
            r = t, g = p, b = v;
            break;
        case 5:
            r = v, g = p, b = q;
            break;
    }

    const R = parseInt(r * 255);
    const B = parseInt(b * 255);
    const G = parseInt(g * 255);

    return [R, G, B];
}

function rgbToBin(RGB) {
    // Wait for a triplet of integers
    // Return a binary
    return parseInt("111111" + RGB[0].toString(2) + RGB[1].toString(2) + RGB[2].toString(2), 2);
}

function componentToHex(c) {
    // Wait for an integerm return a hexadecimal
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(RGB) {
    // Wait for a triplet of integers
    // Return a hex
    return "#" + componentToHex(RGB[0]) + componentToHex(RGB[1]) + componentToHex(RGB[2]);
}

function hexToRgb(hex) {
    // Wait for a hex
    // Return a JSON parsed
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function hex2bin(hex) {
    // Wait for a hex
    // Return a binary
    return (parseInt(hex, 16).toString(10));
}

function rgbToHsv(r, g, b) {
    // Wait for 3 integers
    // Return a tr
    // Wait for a triplet of integers
    // Return a hexiplet
    r /= 255, g /= 255, b /= 255;

    let max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    let h, s, v = max;

    let d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }

        h /= 6;
    }

    return [h, s, v];
}

//--------------------------------------------------------------------------
// DOM actions
//--------------------------------------------------------------------------

function createLight(lien) {
    // Wait for a JSON object
    // Add a new line for a light

    components.gridData.push({
        id: lien.id,
        roomId: lien.roomId,
        level: lien.level,
        hue: lien.hue,
        saturation: lien.saturation,
        value: lien.value,
        color: rgbToHex(hsvToRgb(lien.hue, lien.saturation, lien.value)),
        connected: lien.connected,
        status: "status_" + lien.id,
        delete: "delete_" + lien.id
    });

    function checkLight() {

        if (document.getElementById("img_delete_" + lien.id)) {
            // Light id
            const idLight = document.getElementById("button_id_" + lien.id);

            // Room id
            const idRoom = document.getElementById("button_roomId_" + lien.id);

            // Level
            const spanLevel = document.getElementById("span_level_" + lien.id);
            const level = document.createElement("input");
            level.type = "range";
            level.min = 0;
            level.max = 255;
            level.value = lien.level;
            spanLevel.removeChild(spanLevel.firstChild);
            spanLevel.appendChild(level);

            // Hue
            const spanHue = document.getElementById("span_hue_" + lien.id);
            const hue = document.createElement("input");
            hue.type = "range";
            hue.min = 0;
            hue.max = 360;
            hue.step = "any";
            hue.value = lien.hue;
            spanHue.removeChild(spanHue.firstChild);
            spanHue.appendChild(hue);

            // Saturation
            const spanSaturation = document.getElementById("span_saturation_" + lien.id);
            const saturation = document.createElement("input");
            saturation.type = "range";
            saturation.min = 0;
            saturation.max = 1;
            saturation.step = "any";
            saturation.value = lien.saturation;
            spanSaturation.removeChild(spanSaturation.firstChild);
            spanSaturation.appendChild(saturation);

            // Value
            const spanValue = document.getElementById("span_value_" + lien.id);
            const value = document.createElement("input");
            value.type = "range";
            value.min = 0;
            value.max = 1;
            value.step = "any";
            value.value = lien.value;
            spanValue.removeChild(spanValue.firstChild);
            spanValue.appendChild(value);

            // Color
            const spanColor = document.getElementById("span_color_" + lien.id);
            const parentSpanColor = spanColor.parentElement;
            const color = document.createElement("div");
            color.style.border = "1px solid black";
            color.style.padding = "1em";
            color.style.backgroundColor = rgbToHex(hsvToRgb(lien.hue, lien.saturation, lien.value));
            parentSpanColor.removeChild(parentSpanColor.firstChild);
            parentSpanColor.appendChild(color);

            // Connected light
            //button
            const connectedLight = document.getElementById("button_connected_" + lien.id);
            connectedLight.removeChild(connectedLight.lastChild);

            //CSS
            const connectedLightPitcure = document.getElementById("img_connected_" + lien.id);
            connectedLightPitcure.style.display = "flex";
            connectedLightPitcure.src = lien.connected ? "media/connected.svg" : "media/disconnected.svg";

            // Switch light
            //button
            const switchLight = document.getElementById("button_status_" + lien.id);

            //CSS
            switchLight.removeChild(switchLight.lastChild);
            const switchLightPitcure = document.getElementById("img_status_" + lien.id);
            switchLightPitcure.style.display = "flex";
            switchLightPitcure.src = lien.status == "ON" ? "media/light_bulb_on.png" : "media/light_bulb_off.png";

            // Delete light
            const deleteLight = document.getElementById("button_delete_" + lien.id);

            deleteLight.removeChild(deleteLight.lastChild);
            const deleteLightPicture = document.getElementById("img_delete_" + lien.id);
            deleteLightPicture.style.display = "flex";
            deleteLightPicture.src = "media/delete.png";

            //--------------------------------------------------------------------------
            // DOM actions
            //--------------------------------------------------------------------------

            idLight.onclick = function () {
                changeBorder(lightsButton);
                cleanElement(formAddItem);
                modifyAddButton(true, "Add light");

                components.gridColumns = ['id', 'roomId', 'level', 'hue', 'saturation', 'color', 'value', 'connected', 'status', 'delete'];
                components.gridData = [];

                ajaxGet(getLights + lien.id, function (reponse) {
                    createLight(JSON.parse(reponse));
                });
            };

            idRoom.onclick = function () {
                changeBorder(roomsButton);
                cleanElement(formAddItem);
                modifyAddButton(true, "Add room");

                components.gridColumns = ['id', 'name', 'floor', 'buildingId', 'status', 'delete'];
                components.gridData = [];

                ajaxGet(getRooms + lien.roomId, function (reponse) {
                    createRoom(JSON.parse(reponse));
                });
            };

            level.oninput = function (e) {
                lien.level = e.target.value;
                ajaxPost(getLights, lien, function (reponse) {
                    const result = JSON.parse(reponse);
                    components.gridData = components.gridData.filter(el => el.id === lien.id ? result : el);
                    level.value = result.level;
                }, true);
            }

            hue.oninput = function (e) {
                const RGB = hsvToRgb(e.target.value, lien.saturation, lien.value);
                const newColor = {
                    "argb": rgbToBin(RGB),
                    "hue": e.target.value,
                    "saturation": lien.saturation,
                    "value": lien.value
                }
                ajaxPut(getLights + lien.id + '/color', newColor, function (reponse) {
                    const result = JSON.parse(reponse);
                    components.gridData = components.gridData.filter(el => el.id === lien.id ? result : el);
                    lien.hue = result.hue;
                    hue.value = result.hue;
                    color.style.backgroundColor = rgbToHex(hsvToRgb(lien.hue, lien.saturation, lien.value));
                }, true);
            }

            saturation.oninput = function (e) {
                const RGB = hsvToRgb(lien.hue, e.target.value, lien.value);
                const newColor = {
                    "argb": rgbToBin(RGB),
                    "hue": lien.hue,
                    "saturation": e.target.value,
                    "value": lien.value
                };
                ajaxPut(getLights + lien.id + '/color', newColor, function (reponse) {
                    const result = JSON.parse(reponse);
                    components.gridData = components.gridData.filter(el => el.id === lien.id ? result : el);
                    lien.saturation = result.saturation;
                    saturation.value = result.saturation;
                    color.style.backgroundColor = rgbToHex(hsvToRgb(lien.hue, lien.saturation, lien.value));
                }, true);
            };

            value.oninput = function (e) {
                const RGB = hsvToRgb(lien.hue, lien.saturation, e.target.value);
                const newColor = {
                    "argb": rgbToBin(RGB),
                    "hue": lien.hue,
                    "saturation": lien.saturation,
                    "value": e.target.value
                }
                ajaxPut(getLights + lien.id + '/color', newColor, function (reponse) {
                    const result = JSON.parse(reponse);
                    components.gridData = components.gridData.filter(el => el.id === lien.id ? result : el);
                    lien.value = result.value;
                    value.value = result.value;
                    color.style.backgroundColor = rgbToHex(hsvToRgb(lien.hue, lien.saturation, lien.value));
                }, true);
            };

            switchLight.onclick = function () {
                lien.status = lien.status == "ON" ? "OFF" : "ON";
                ajaxPut(getLights + lien.id + '/switch', lien, function (reponse) {
                    const result = JSON.parse(reponse);
                    switchLightPitcure.src = result.status == "ON" ? "media/light_bulb_on.png" : "media/light_bulb_off.png";
                }, true);
            };

            deleteLight.onclick = function () {
                ajaxDelete(getLights + lien.id, function (reponse) {
                    components.gridData = components.gridData.filter(el => el.id !== lien.id)
                }, true);
            };
        } else {
            setTimeout(checkLight, 100);
        }
    }

    checkLight();

}

function createRoom(lien) {
    // Wait for a JSON object
    // Add a new line for a room

    components.gridData.push({
        id: lien.id,
        name: lien.name,
        floor: lien.floor,
        buildingId: lien.buildingId,
        status: "status_" + lien.id,
        delete: "delete_" + lien.id
    });

    function checkRoom() {

        if (document.getElementById("img_delete_" + lien.id)) {

            // Room id
            const idRoom = document.getElementById("button_id_" + lien.id);

            // Name
            const idName = document.getElementById("button_name_" + lien.id);

            // Floor
            const idFloor = document.getElementById("button_floor_" + lien.id);

            // Building id
            const idBuilding = document.getElementById("button_buildingId_" + lien.id);

            // Switch light
            //button
            const switchLight = document.getElementById("button_status_" + lien.id);

            //CSS
            switchLight.removeChild(switchLight.lastChild);
            const switchLightPitcure = document.getElementById("img_status_" + lien.id);
            switchLightPitcure.style.display = "flex";
            switchLightPitcure.src = lien.status == "ON" ? "media/light_switch_on.png" : "media/light_switch_off.png";

            // Delete room
            const deleteRoom = document.getElementById("button_delete_" + lien.id);

            deleteRoom.removeChild(deleteRoom.lastChild);
            const deleteRoomPicture = document.getElementById("img_delete_" + lien.id);
            deleteRoomPicture.style.display = "flex";
            deleteRoomPicture.src = "media/delete.png";

            //--------------------------------------------------------------------------
            // DOM actions
            //--------------------------------------------------------------------------

            idRoom.onclick = function () {
                changeBorder(roomsButton);
                cleanElement(formAddItem);
                modifyAddButton(true, "Add light");

                components.gridColumns = ['id', 'roomId', 'level', 'hue', 'saturation', 'color', 'value', 'connected', 'status', 'delete'];
                components.gridData = [];

                ajaxGet(getRooms + lien.id + '/lights', function (reponse) {
                    const reponseLien = JSON.parse(reponse);
                    reponseLien.forEach(function (lien) {
                        createLight(lien);
                    });
                });
            };

            idBuilding.onclick = function () {
                changeBorder(buildingsButton);
                cleanElement(formAddItem);
                modifyAddButton(true, "Add building");

                components.gridColumns = ['id', 'name', 'delete'];
                components.gridData = [];

                ajaxGet(getBuildings + lien.buildingId, function (reponse) {
                    createBuilding(JSON.parse(reponse));
                });
            };

            idFloor.onclick = function () {
                changeBorder(roomsButton);
                cleanElement(formAddItem);
                modifyAddButton(true, "Add room");

                components.gridColumns = ['id', 'name', 'floor', 'buildingId', 'status', 'delete'];
                components.gridData = [];

                ajaxGet(getRooms, function (reponse) {
                    const reponseLien = JSON.parse(reponse);
                    reponseLien.forEach(function (thisLien) {
                        if (lien.floor === thisLien.floor && lien.buildingId === thisLien.buildingId) {
                            createRoom(thisLien);
                        }
                    });
                });
            };

            switchLight.onclick = function () {
                lien.status = lien.status == "ON" ? "OFF" : "ON";
                ajaxPut(getRooms + lien.id + "/switch", lien, function (reponse) {
                    const result = JSON.parse(reponse);
                    if (result[0]) {
                        switchLightPitcure.src = result[0].status == "ON" ? "media/light_switch_on.png" : "media/light_switch_off.png";
                    }
                }, true);
            };

            deleteRoomPicture.onclick = function () {
                ajaxDelete(getRooms + lien.id, function (reponse) {
                    components.gridData = components.gridData.filter(el => el.id !== lien.id)
                }, true);
            };
        } else {
            setTimeout(checkRoom, 100);
        }
    }

    checkRoom();
}

function createBuilding(lien) {
    // Wait for a JSON object
    // Add a new line for a building

    components.gridData.push({
        id: lien.id,
        name: lien.name,
        delete: "delete_" + lien.id
    });

    function checkBuilding() {

        if (document.getElementById("img_delete_" + lien.id)) {

            // Room id
            const idBuilding = document.getElementById("button_id_" + lien.id);

            // Name
            const idName = document.getElementById("button_name_" + lien.id);

            // Delete building
            const deleteBuilding = document.getElementById("button_delete_" + lien.id);

            deleteBuilding.removeChild(deleteBuilding.lastChild);
            const deleteBuildingPicture = document.getElementById("img_delete_" + lien.id);
            deleteBuildingPicture.style.display = "flex";
            deleteBuildingPicture.src = "media/delete.png";

            //Check if all the lights are on
            let isLightOn = false;
            switchLightPitcure.src = "media/light_switch_off.png";

            ajaxGet(getBuildings + lien.id + '/rooms', function (reponse) {
                const reponseLien = JSON.parse(reponse);
                reponseLien.forEach(function (thisLien) {
                    if (thisLien.status == "ON") {
                        isLightOn = true;
                        switchLightPitcure.src = "media/light_switch_on.png";
                        return;
                    };
                });
            });

            //--------------------------------------------------------------------------
            // DOM actions
            //--------------------------------------------------------------------------

            idBuilding.onclick = function () {
                changeBorder(buildingsButton);
                cleanElement(formAddItem);
                modifyAddButton(true, "Add room");

                components.gridColumns = ['id', 'name', 'floor', 'buildingId', 'status', 'delete'];
                components.gridData = [];

                ajaxGet(getBuildings + lien.id + '/rooms', function (reponse) {
                    const reponseLien = JSON.parse(reponse);
                    reponseLien.forEach(function (lien) {
                        createRoom(lien);
                    });
                });
            };

            deleteBuilding.onclick = function () {
                ajaxDelete(getBuildings + lien.id, function (reponse) {
                    components.gridData = components.gridData.filter(el => el.id !== lien.id)
                }, true);
            };
        } else {
            setTimeout(checkBuilding, 100);
        }
    }

    checkBuilding();

}

function modifyAddButton(show, type) {
    // Wait for a boolean and a string among ["Add light", "Add room", "Add building"]
    // Add the correct form and display it

    divAddButton.style.display = show ? "block" : "none";
    addButton.onclick = function () {
        divFormAddItem.style.display = "block";
        divFormAddItem.style.animationName = "addItem";
        divFormAddItem.style.animationDuration = "2s";

        cleanElement(formAddItem);

        addItem(type);
    };
}

function addItem(type) {
    // Wait for a string
    // Create a form according to the type sent : "Add light", "Add room", "Add building"

    divAddButton.style.display = "none";

    if (type == "Add light") {

        const roomId = document.createElement("select");

        ajaxGet(getRooms, function (reponse) {
            const reponseLien = JSON.parse(reponse);
            let index = 0;
            reponseLien.forEach(function (lien) {
                const option = document.createElement("option");
                option.value = lien.id;
                option.text = "Room ID : " + lien.id;
                roomId.options.add(option, index);
                index++;
            });
        });

        // Level
        const level = document.createElement("input");
        level.type = "range";
        level.min = 0;
        level.max = 255;
        level.value = 0;
        level.required = true;
        level.style.width = "10em";

        const status = document.createElement("select");
        const on = document.createElement("option");
        const off = document.createElement("option");
        on.text = "ON";
        off.text = "OFF";
        status.options.add(on, 0);
        status.options.add(off, 1);

        const submit = document.createElement("input");
        submit.type = "submit";

        formAddItem.appendChild(roomId);
        formAddItem.appendChild(level);
        formAddItem.appendChild(status);
        formAddItem.appendChild(submit);

        formAddItem.onsubmit = function (e) {
            e.preventDefault();
            if (!isAddLightInitialized) {

                isAddLightInitialized = !isAddLightInitialized;

                ajaxPost(getLights, {
                    level: level.value,
                    status: status.value,
                    roomId: parseInt(roomId.value)
                }, function (reponse) {

                    createLight(JSON.parse(reponse));

                    cleanElement(formAddItem);
                    divFormAddItem.style.display = "none";
                    modifyAddButton(true, type);

                }, true);
            }
        }

    } else if (type == "Add room") {

        const name = document.createElement("input");
        name.type = "text";
        name.placeholder = "Name";
        name.required = true;

        const floor = document.createElement("input");
        floor.type = "number"
        floor.placeholder = "Floor";
        floor.required = true;

        const buildingId = document.createElement("select");

        ajaxGet(getBuildings, function (reponse) {
            const reponseLien = JSON.parse(reponse);
            let index = 0;
            reponseLien.forEach(function (lien) {
                const option = document.createElement("option");
                option.value = lien.id;
                option.text = "Building ID : " + lien.id;
                buildingId.options.add(option, index);
                index++;
            });
        });

        const submit = document.createElement("input");
        submit.type = "submit";

        formAddItem.appendChild(name);
        formAddItem.appendChild(floor);
        formAddItem.appendChild(buildingId);
        formAddItem.appendChild(submit);

        formAddItem.onsubmit = function (e) {
            e.preventDefault();
            if (!isAddRoomInitialized) {

                isAddRoomInitialized = !isAddRoomInitialized;
                ajaxPost(getRooms, {
                    name: name.value,
                    floor: floor.value,
                    buildingId: buildingId.value
                }, function (reponse) {

                    createRoom(JSON.parse(reponse));

                    cleanElement(formAddItem);
                    divFormAddItem.style.display = "none";
                    modifyAddButton(true, type);

                }, true);
            }
        }

    } else if (type == "Add building") {

        const name = document.createElement("input");
        name.type = "text";
        name.placeholder = "Name";
        name.required = true;

        const submit = document.createElement("input");
        submit.type = "submit";

        formAddItem.appendChild(name);
        formAddItem.appendChild(submit);

        formAddItem.onsubmit = function (e) {
            if (!isAddBuildingInitialized) {

                isAddBuildingInitialized = !isAddBuildingInitialized;

                ajaxPost(getBuildings, {
                    name: name.value
                }, function (reponse) {

                    createBuilding(JSON.parse(reponse));

                    cleanElement(formAddItem);
                    divFormAddItem.style.display = "none";
                    modifyAddButton(true, type);

                }, true);
            }
        }
    }

}

function cleanElement(element) {
    // Wait for a DOM elements
    // Remove all children
    if (element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
}

function changeBorder(elt) {
    // Wait for a DOM elements
    // Change its color to black
    if (lastButton != elt) {
        elt.style.color = "#000000";
        elt.onmouseover = function () {}
        elt.onmouseout = function () {}
        lastButton.style.color = "#ffffff";
        lastButton.onmouseover = function () {
            this.style.color = "#000000";
        }
        lastButton.onmouseout = function () {
            this.style.color = "#ffffff";
        }
        lastButton = elt;
    }
}

//--------------------------------------------------------------------------
// Grid template
//--------------------------------------------------------------------------

Vue.component('components-grid', {
    template: '#components-grid-template',
    props: {
        data: Array,
        columns: Array,
        filterKey: String
    },
    data: function () {
        let sortOrders = {}
        this.columns.forEach(function (key) {
            sortOrders[key] = 1
        })
        return {
            sortKey: '',
            sortOrders: sortOrders
        }
    },
    computed: {
        filteredData: function () {
            let sortKey = this.sortKey
            let filterKey = this.filterKey && this.filterKey.toLowerCase()
            let order = this.sortOrders[sortKey] || 1
            let data = this.data
            if (filterKey) {
                data = data.filter(function (row) {
                    return Object.keys(row).some(function (key) {
                        return String(row[key]).toLowerCase().indexOf(filterKey) > -1
                    })
                })
            }
            if (sortKey) {
                data = data.slice().sort(function (a, b) {
                    a = a[sortKey]
                    b = b[sortKey]
                    return (a === b ? 0 : a > b ? 1 : -1) * order
                })
            }

            return data
        }
    },
    filters: {
        capitalize: function (str) {
            let temp = str.split(/(?=[A-Z])/);
            temp[0] = temp[0].charAt(0).toUpperCase() + temp[0].slice(1)
            return temp.join(' ');
        }
    }
})

const components = new Vue({
    el: '#components',
    data: {
        searchQuery: '',
        gridColumns: [],
        gridData: []
    }
});

//--------------------------------------------------------------------------
// Menu template
//--------------------------------------------------------------------------

const stringButton = "ButtonVue";

Vue.component('menu-item', {
    props: ['item'],
    template: '<button class="buttonHeader">{{item.text}}</button>'
})

let menu = new Vue({
    el: '#divButtonHeaderVue',
    data: {
        menuItems: [
            {
                id: 'light' + stringButton,
                text: 'Lights'
            },
            {
                id: 'room' + stringButton,
                text: 'Rooms'
            },
            {
                id: 'building' + stringButton,
                text: 'Buildings'
            }
    ]
    }
})

//--------------------------------------------------------------------------
// Initialisation
//--------------------------------------------------------------------------

function init() {
    // initialisation function
    // run until the buttons are available

    lightsButton = document.getElementById("lightButtonVue");
    roomsButton = document.getElementById("roomButtonVue");
    buildingsButton = document.getElementById("buildingButtonVue");

    if (lightsButton && roomsButton && buildingsButton) {

        // react to the lights button
        lightsButton.onclick = function () {
            changeBorder(lightsButton);
            cleanElement(formAddItem);
            modifyAddButton(true, "Add light");

            components.gridColumns = ['id', 'roomId', 'level', 'hue', 'saturation', 'value', 'color', 'connected', 'status', 'delete'];
            components.gridData = [];

            ajaxGet(getLights, function (reponse) {
                const reponseLien = JSON.parse(reponse);
                reponseLien.forEach(function (lien) {
                    createLight(lien);
                });
            });
        };

        // react to the rooms button
        roomsButton.onclick = function () {
            changeBorder(roomsButton);
            cleanElement(formAddItem);
            modifyAddButton(true, "Add room");

            components.gridColumns = ['id', 'name', 'floor', 'buildingId', 'status', 'delete'];
            components.gridData = [];

            ajaxGet(getRooms, function (reponse) {
                const reponseLien = JSON.parse(reponse);
                reponseLien.forEach(function (lien) {
                    createRoom(lien);
                });
            });
        };

        // react to the building button
        buildingsButton.onclick = function () {
            changeBorder(buildingsButton);
            cleanElement(formAddItem);
            modifyAddButton(true, "Add building");

            components.gridColumns = ['id', 'name', 'delete'];
            components.gridData = [];

            ajaxGet(getBuildings, function (reponse) {
                const reponseLien = JSON.parse(reponse);
                reponseLien.forEach(function (lien) {
                    createBuilding(lien);
                });
            });
        };

        //--------------------------------------------------------------------------
        // Set the initial grid to the rooms
        //--------------------------------------------------------------------------

        cleanElement(formAddItem);
        modifyAddButton(true, "Add room");

        components.gridColumns = ['id', 'name', 'floor', 'buildingId', 'status', 'delete'];
        components.gridData = [];

        ajaxGet(getRooms, function (reponse) {
            const reponseLien = JSON.parse(reponse);
            reponseLien.forEach(function (lien) {
                createRoom(lien);
            });
        });

        roomsButton.style.color = "#000000";

        lastButton = roomsButton;

        subscribe();

    } else {
        setTimeout(init, 100);
    }

}

init();
