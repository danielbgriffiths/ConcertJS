import { ConcertLog, effect, onCleanup, onMount, signal } from "@concertjs/core";

import { ListItem } from "./ListItem";

@ConcertLog
export class ToDoList {
  static render() {
    const [listItems, setListItems] = signal(["Item 1", "Item 2", "Item 3"]);

    const [todoInput, setTodoInput] = signal("");

    onMount(() => {
      console.log("Mounted ToDoList");
    });

    onCleanup(() => {
      console.log("Cleaned up ToDoList");
    });

    effect(() => {
      console.log("listItems", listItems());
    });

    function onChange(event: any): void {
      setTodoInput((event.target as any).value);
    }

    function addItem(): void {
      if (!todoInput()?.length) return;
      setListItems(prev => [...prev, todoInput()]);
      setTodoInput("");
    }

    function deleteItem(item: string): void {
      setListItems(prev => prev.filter(i => i !== item));
    }

    return (
      <div class="todo-list-wrapper">
        <h1 class="todo-list-header">TO DO List</h1>
        <ul class="todo-list">
          {listItems().map(item => (
            <ListItem item={item} onDelete={deleteItem} />
          ))}
        </ul>
        <div>
          <input name="todoInput" onChange={onChange} />
          <button type="button" onClick={addItem}>
            Add Item
          </button>
        </div>
      </div>
    );
  }
}
