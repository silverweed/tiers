/*
	Offline Tierlist Maker
	Copyright (C) 2022  silverweed

 Everyone is permitted to copy and distribute verbatim or modified
 copies of this license document, and changing it is allowed as long
 as the name is changed.

            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

  0. You just DO WHAT THE FUCK YOU WANT TO.
*/

'use strict';

const MAX_NAME_LEN = 200;
const DEFAULT_TIERS = ['S','A','B','C','D','E','F'];

// {
//    rows: [{
//       elem: [row Object],
//       name: "row name",
//       imgs: [img src]
//    }]
//
//    title: "tierlist title"
// }
let tierlist = {
	rows: [],
	title: "",
};

let tierlist_div;

let unsaved_changes = false;

// Contains [[header, input, label]]
let all_headers = [];
let headers_orig_min_width;

let dragged_image;

function reset_list(clear_images = false) {
	document.querySelectorAll('.tierlist span.item').forEach((item) => {
		let images = document.querySelector('.images');
		for (let i = 0; i < item.children.length; ++i) {
			let img = item.children[i];
			item.removeChild(img);
			if (!clear_images) {
				images.appendChild(img);
			}
		}
		item.parentNode.removeChild(item);
	});
	tierlist = {
		rows: [],
		title: "",
	};
	unsaved_changes = true;
}

window.addEventListener('load', () => {
	tierlist_div =  document.querySelector('.tierlist');

	for (let i = 0; i < DEFAULT_TIERS.length; ++i)
		add_row(i, DEFAULT_TIERS[i]);

	document.querySelectorAll('.tierlist div.row').forEach(make_accept_drop);
	make_accept_drop(document.querySelector('.images'));

	bind_title_events();

	create_tiers_label_inputs();

	document.getElementById('load-img-input').addEventListener('input', (evt) => {
		// @Speed: maybe we can do some async stuff to optimize this
		let images = document.querySelector('.images');
		for (let file of evt.target.files) {
			let reader = new FileReader();
			reader.addEventListener('load', (load_evt) => {
				let img = create_img_with_src(load_evt.target.result);
				images.appendChild(img);
				unsaved_changes = true;
			});
			reader.readAsDataURL(file);
		}
	});

	document.getElementById('reset-list-input').addEventListener('click', () => {
		if (confirm('Reset Tierlist? (this will place all images back in the pool)')) {
			reset_list();
		}
	});

	document.getElementById('export-input').addEventListener('click', () => {
		let name = prompt('Please give a name to this tierlist');
		if (name) {
			save_tierlist(`${name}.json`);
		}
	});

	document.getElementById('import-input').addEventListener('input', (evt) => {
		if (!evt.target.files) {
			return;
		}
		let file = evt.target.files[0];
		let reader = new FileReader();
		reader.addEventListener('load', (load_evt) => {
			let raw = load_evt.target.result;
			let parsed = JSON.parse(raw);
			if (!parsed) {
				alert("Failed to parse data");
				return;
			}
			reset_list(true);
			load_tierlist(parsed);
		});
		reader.readAsText(file);
	});

	window.addEventListener('beforeunload', (evt) => {
		if (!unsaved_changes) return null;
		var msg = "You have unsaved changes. Leave anyway?";
		(evt || window.event).returnValue = msg;
		return msg;
	});
});

function create_img_with_src(src) {
	let img = document.createElement('img');
	img.src = src;
	img.style.userSelect = 'none';
	img.classList.add('draggable');
	img.draggable = true;
	img.ondragstart = "event.dataTransfer.setData('text/plain', null)";
	img.addEventListener('mousedown', (evt) => {
		dragged_image = evt.target;
		dragged_image.classList.add("dragged");
	});
	return img;
}

function save(filename, text) {
	unsaved_changes = false;

	var el = document.createElement('a');
	el.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(text));
	el.setAttribute('download', filename);
	el.style.display = 'none';
	document.body.appendChild(el);
	el.click();
	document.body.removeChild(el);
}

function save_tierlist(filename) {
	let serialized_tierlist = {
		title: document.querySelector('.title-label').innerText,
		rows: [],
	};
	for (let i = 0; i < tierlist.rows.length; ++i) {
		let row = tierlist.rows[i];
		serialized_tierlist.rows.push({
			name: row.name,
			//document.querySelector(`.tierlist .${key}`).querySelector('label').innerText.substr(0, MAX_NAME_LEN)
		});
		let imgs = row.imgs;
		if (imgs) {
			serialized_tierlist.rows[i].imgs = imgs.map(img => img.src);
		}
	}

	let untiered_imgs = document.querySelectorAll('.images img');
	if (untiered_imgs.length > 0) {
		serialized_tierlist.untiered = [];
		untiered_imgs.forEach((img) => {
			serialized_tierlist.untiered.push(img.src);
		});
	}

	save(filename, JSON.stringify(serialized_tierlist));
}

function load_tierlist(serialized_tierlist) {
	document.querySelector('.title-label').innerText = serialized_tierlist.title;
	for (let i = 0; i < serialized_tierlist.rows.length; ++i)
		add_row(i, serialized_tierlist.rows[i].name);

	for (let idx in serialized_tierlist.rows) {
		let elem = tierlist.rows[idx]?.elem;
		if (!elem) {
			continue;
		}

		let ser_row = serialized_tierlist.rows[idx];

		for (let img_src of ser_row.imgs ?? []) {
			let img = create_img_with_src(img_src);
			let td = document.createElement('span');
			td.classList.add('item');
			td.appendChild(img);
			let items_container = tier.querySelector('.items');
			items_container.appendChild(td);
			if (!tierlist.rows[key]) {
				tierlist.rows[key] = {
					name: ser_row.name,
					imgs: []
				};
			}
			tierlist.rows[key].imgs.push(img);
		}

		tier.querySelector('label').innerText = ser_row.name;
	}

	if (serialized_tierlist.untiered) {
		let images = document.querySelector('.images');
		for (let img_src of serialized_tierlist.untiered) {
			let img = create_img_with_src(img_src);
			images.appendChild(img);
		}
	}

	resize_headers();

	unsaved_changes = false;
}

function end_drag(evt) {
	dragged_image?.classList.remove("dragged");
	dragged_image = null;
}

window.addEventListener('mouseup', end_drag);
window.addEventListener('dragend', end_drag);

function make_accept_drop(elem) {
	elem.classList.add('droppable');

	elem.addEventListener('dragenter', (evt) => {
		evt.target.classList.add('drag-entered');
	});
	elem.addEventListener('dragleave', (evt) => {
		evt.target.classList.remove('drag-entered');
	});
	elem.addEventListener('dragover', (evt) => {
		evt.preventDefault();
	});
	elem.addEventListener('drop', (evt) => {
		evt.preventDefault();
		evt.target.classList.remove('drag-entered');

		if (!dragged_image) {
			return;
		}

		let dragged_image_parent = dragged_image.parentNode;
		if (dragged_image_parent.tagName.toUpperCase() === 'SPAN' &&
				dragged_image_parent.classList.contains('item')) {
			// We were already in a tier
			let containing_tr = dragged_image_parent.parentNode;
			containing_tr.removeChild(dragged_image_parent);

			let row = retrieve_row(containing_tr.parentNode);
			if (row) {
				console.log("old row: ", row);
				let removed_idx = row.imgs.indexOf(dragged_image);
				console.log("rm idx: ", removed_idx);
				if (removed_idx >= 0) {
					row.imgs.splice(removed_idx, 1);
				}
			}
		} else {
			dragged_image_parent.removeChild(dragged_image);
		}
		let td = document.createElement('span');
		td.classList.add('item');
		td.appendChild(dragged_image);
		let items_container = elem.querySelector('.items');
		if (!items_container) {
			// Quite lazy hack for <section class='images'>
			items_container = elem;
		}
		items_container.appendChild(td);

		let row = retrieve_row(elem);
		if (row) {
			row.imgs.push(dragged_image);
			unsaved_changes = true;
		}
	});
}

function retrieve_row(elem) {
	for (let row of tierlist.rows) {
		if (row.elem === elem) {
			return row;
		}
	}
	return null;
}

function enable_edit_on_click(container, input, label) {
	function change_label(evt) {
		input.style.display = 'none';
		label.innerText = input.value;
		label.style.display = 'inline';
		unsaved_changes = true;
	}

	input.addEventListener('change', change_label);
	input.addEventListener('focusout', change_label);

	container.addEventListener('click', (evt) => {
		label.style.display = 'none';
		input.value = label.innerText.substr(0, MAX_NAME_LEN);
		input.style.display = 'inline';
		input.select();
	});
}

function bind_title_events() {
	let title_label = document.querySelector('.title-label');
	let title_input = document.getElementById('title-input');
	let title = document.querySelector('.title');

	enable_edit_on_click(title, title_input, title_label);
}

function create_tiers_label_inputs() {
	all_headers = [];
	document.querySelectorAll('.row').forEach((row) => {
		let tier_name = '';
		for (let tier of DEFAULT_TIERS) {
			if (row.classList.contains(tier)) {
				tier_name = tier;
				break;
			}
		}
		console.assert(tier_name.length > 0, "We have an element of class .row which is not any of the known tiers!");

		let input = document.createElement('input');
		input.id = `input-tier-${tier_name}`;
		input.type = 'text';
		let label = document.createElement('label');
		label.htmlFor = input.id;
		label.innerText = tier_name.toUpperCase();

		let header = row.querySelector('.header');
		all_headers.push([header, input, label]);
		header.appendChild(label);
		header.appendChild(input);

		enable_edit_on_click(header, input, label);
	});

	headers_orig_min_width = all_headers[0][0].clientWidth;
	for (let [_h, input, _l] of all_headers) {
		input.addEventListener('change', resize_headers);
	}
}


function resize_headers() {
	let max_width = headers_orig_min_width;
	for (let [other_header, _i, label] of all_headers) {
		max_width = Math.max(max_width, label.clientWidth);
	}

	for (let [other_header, _i2, _l2] of all_headers) {
		other_header.style.minWidth = `${max_width}px`;
	}
}

function add_row(index, subclass) {
	let div = document.createElement('div');
	let header = document.createElement('span');
	let items = document.createElement('span');
	div.classList.add('row');
	div.classList.add(subclass.toLowerCase()); // TODO
	header.classList.add('header');
	items.classList.add('items');
	div.appendChild(header);
	div.appendChild(items);
	let row_buttons = document.createElement('div');
	row_buttons.classList.add('row-buttons');
	let btn_plus_up = document.createElement('input');
	btn_plus_up.type = "button";
	btn_plus_up.value = '+';
	btn_plus_up.title = "Add row above";
	btn_plus_up.addEventListener('clicked', (event) => {

	});
	let btn_rm = document.createElement('input');
	btn_rm.type = "button";
	btn_rm.value = '-';
	btn_rm.title = "Remove row";
	let btn_plus_down = document.createElement('input');
	btn_plus_down.type = "button";
	btn_plus_down.value = '+';
	btn_plus_down.title = "Add row below";
	row_buttons.appendChild(btn_plus_up);
	row_buttons.appendChild(btn_rm);
	row_buttons.appendChild(btn_plus_down);
	div.appendChild(row_buttons);

	let rows = tierlist_div.childNodes;
	if (index === rows.length) {
		tierlist_div.appendChild(div);
	} else {
		let nxt_child = rows[index];
		tierlist_div.insertBefore(div, nxt_child);
	}

	tierlist.rows.splice(index, 0, {
		elem: div,
		name: subclass,
		imgs: []
	});
}


