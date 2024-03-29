'use strict';

const STORE = {
  items: [
    {id: cuid(), name: "apples", checked: false, searched: true},
    {id: cuid(), name: "oranges", checked: false, searched: true},
    {id: cuid(), name: "milk", checked: true, searched: true},
    {id: cuid(), name: "bread", checked: false, searched: true}
  ],
  hideCompleted: false,
  searchCompleted: false
};

function generateItemElement(item) {
  return `
    <li data-item-id="${item.id}">
      <span class="shopping-item js-shopping-item ${item.checked ? "shopping-item__checked" : ''}">${item.name}</span>
      <div class="shopping-item-controls">
        <button class="shopping-item-toggle js-item-toggle">
            <span class="button-label">check</span>
        </button>
        <button class="shopping-item-delete js-item-delete">
            <span class="button-label">delete</span>
        </button>
        <!-- Creates edit buttons for each 'li'-->
        <button class="shopping-item-edit js-item-edit">
          <span class="button-label">edit</span>
        </button>
      </div>
    </li>`;
}


function generateShoppingItemsString(shoppingList) {
  console.log("Generating shopping list element");

  const items = shoppingList.map((item) => generateItemElement(item));
  
  return items.join("");
}


function renderShoppingList(searchTerm) {
  // render the shopping list in the DOM
  console.log('`renderShoppingList` ran');

  // set up a copy of the store's items in a local variable that we will reassign to a new
  // version if any filtering of the list occurs
  let filteredItems = STORE.items;

  // if the `hideCompleted` property is true, then we want to reassign filteredItems to a version
  // where ONLY items with a "checked" property of false are included
  if (STORE.hideCompleted) {
    filteredItems = filteredItems.filter(item => !item.checked);
  }

  // Checks to see if user has submitted a search //passing searchTerm
  if(STORE.searchCompleted) {
    // if user has submitted a search, searchItems with filteredItems
    filteredItems = filteredItems.filter(item => {
      return item.name === searchTerm
      STORE.searchCompleted = false;
    });
     
  }
  // at this point, all filtering work has been done (or not done, if that's the current settings), so
  // we send our `filteredItems` into our HTML generation function 
  const shoppingListItemsString = generateShoppingItemsString(filteredItems);

  // insert that HTML into the DOM
  $('.js-shopping-list').html(shoppingListItemsString);
}

function addItemToShoppingList(itemName) {
  console.log(`Adding "${itemName}" to shopping list`);
  STORE.items.push({name: itemName, checked: false});
}

function handleNewItemSubmit() {
  $('#js-shopping-list-form').submit(function(event) {
    event.preventDefault();
    console.log('`handleNewItemSubmit` ran');
    const newItemName = $('.js-shopping-list-entry').val();
    $('.js-shopping-list-entry').val(''); // WHY IS THIS HERE TWICE?
    addItemToShoppingList(newItemName);
    renderShoppingList();
  });
}

function toggleCheckedForListItem(itemId) {
  console.log("Toggling checked property for item with id " + itemId);
  const item = STORE.items.find(item => item.id === itemId);
  item.checked = !item.checked;
}


function getItemIdFromElement(item) {
  return $(item)
    .closest('li')
    .data('item-id');
}

function handleItemCheckClicked() {
  $('.js-shopping-list').on('click', `.js-item-toggle`, event => {
    console.log('`handleItemCheckClicked` ran');
    const id = getItemIdFromElement(event.currentTarget);
    toggleCheckedForListItem(id);
    renderShoppingList();
  });
}


// name says it all. responsible for deleting a list item.
function deleteListItem(itemId) {
  console.log(`Deleting item with id  ${itemId} from shopping list`)

  // as with `addItemToShoppingLIst`, this function also has the side effect of
  // mutating the global STORE value.
  //
  // First we find the index of the item with the specified id using the native
  // Array.prototype.findIndex() method. Then we call `.splice` at the index of 
  // the list item we want to remove, with a removeCount of 1.
  const itemIndex = STORE.items.findIndex(item => item.id === itemId);
  STORE.items.splice(itemIndex, 1);
}


function handleDeleteItemClicked() {
  // like in `handleItemCheckClicked`, we use event delegation
  $('.js-shopping-list').on('click', '.js-item-delete', event => {
    // get the index of the item in STORE
    const itemIndex = getItemIdFromElement(event.currentTarget);
    // delete the item
    deleteListItem(itemIndex);
    // render the updated shopping list
    renderShoppingList();
  });
}

// Toggles the STORE.hideCompleted property
function toggleHideFilter() {
  STORE.hideCompleted = !STORE.hideCompleted;
}

// Places an event listener on the checkbox for hiding completed items
function handleToggleHideFilter() {
  $('.js-hide-completed-toggle').on('click', () => {
    toggleHideFilter();
    renderShoppingList();
  });
}

// USER CAN TYPE IN A SEARCH TERM AND THE DISPLAYED LIST WILL BE FILTERED BY ITEM NAMES ONLY CONTAINING THAT SEARCH TERM

// Listen for a user to submit a search
function handleSearchItemSubmit() {
  $('#js-search-controls').submit(function(event) {
    event.preventDefault(); 
    //console.log('`handleSearchItemSubmit` ran');
    // get the user's search term from the DOM
    const searchTerm = $('.js-search-bar-entry').val();
    // let the STORE now a search was compelted
    
    STORE.searchCompleted = true;
    //console.log(searchItem);
    renderShoppingList(searchTerm);
  });
}



// USER CAN EDIT THE TITLE OF AN ITEM
// using prompt() creates a dialog input box, which returns user input if user chooses "OK" or returns null; Syntax = prompt(text, defaultText)

// Listen for user click on edit buttons
function handleEditItemClicked() {
  $('.js-shopping-list').on('click', '.js-item-edit', event => {
    //console.log('`handleEditItemClicked` ran');
    // get the itemIndex from the item clicked
    const itemIndex = getItemIdFromElement(event.currentTarget);
    editItemClicked(itemIndex);
    // render the updated shopping list
    renderShoppingList();
  });
}

// Create prompt dialog box on click
function editItemClicked(itemId) {
  const editTerm = prompt('What is your new item name?');
  // Take user input from dialog box and update item with user input
  if(editTerm !== null) {
    const itemIndex2 = STORE.items.findIndex(item => item.id === itemId);
    //console.log(itemId);
  
    STORE.items[itemIndex2].name = editTerm;
    //console.log(STORE.items[itemIndex2]);
  }
  
}






// this function will be our callback when the page loads. it's responsible for
// initially rendering the shopping list, and activating our individual functions
// that handle new item submission and user clicks on the "check" and "delete" buttons
// for individual shopping list items.
function handleShoppingList() {
  renderShoppingList();
  handleNewItemSubmit();
  handleItemCheckClicked();
  handleDeleteItemClicked();
  handleToggleHideFilter();
  handleSearchItemSubmit();
  handleEditItemClicked();
}

// when the page loads, call `handleShoppingList`
$(handleShoppingList);