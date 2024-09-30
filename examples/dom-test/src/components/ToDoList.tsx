import { ConcertLog, effect, onCleanup, onMount, signal } from "@concertjs/core";

import { ListItem } from "./ListItem";

@ConcertLog
export class ToDoList {
  static render() {
    let inputRef!: HTMLInputElement | null;

    const [listItems, setListItems] = signal(["Item 1", "Item 2", "Item 3"]);

    const [todoInput, setTodoInput] = signal("");

    onMount(() => {
      console.info("Mounted ToDoList");
      window.addEventListener("keyup", onEnter);
    });

    onCleanup(() => {
      console.info("Cleaned up ToDoList");
      window.removeEventListener("keyup", onEnter);
    });

    effect(() => {
      console.info("listItems", listItems());
    });

    function onChange(event: any): void {
      setTodoInput((event.target as any).value);
    }

    function addItem(): void {
      if (todoInput()?.length < 2) return;
      setListItems(prev => [...prev, todoInput()]);
      setTodoInput("");
      if (inputRef) {
        inputRef.value = "";
      }
    }

    function deleteItem(item: string): void {
      setListItems(prev => prev.filter(i => i !== item));
    }

    function updateItem(oldItem: string, nextItem: string): void {
      setListItems(prev => prev.map(item => (item === oldItem ? nextItem : item)));
    }

    function onEnter(event: KeyboardEvent): void {
      if (event.key !== "Enter" || todoInput()?.length < 2) return;
      addItem();
    }

    function setInputRef(ref: HTMLInputElement | null): void {
      inputRef = ref;
    }

    return (
      <div class="todo-list-wrapper">
        <h1 class="todo-list-header">TO DO List</h1>
        <ul class="todo-list">
          {listItems().map(item => (
            <ListItem item={item} onDelete={deleteItem} onUpdate={updateItem} />
          ))}
        </ul>
        <div>
          <input ref={setInputRef} name="todoInput" onChange={onChange} />
          <button type="button" onClick={addItem}>
            Add Item
          </button>
        </div>
      </div>
    );
  }
}
