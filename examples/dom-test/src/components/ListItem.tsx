import {
  ConcertLog,
  ConcertSignalGetter,
  effect,
  onCleanup,
  onMount,
  signal
} from "@concertjs/core";

interface Props {
  item: string;
  randomNumber: ConcertSignalGetter;
  onDelete: (item: string) => void;
  onUpdate: (oldItem: string, newItem: string) => void;
}

@ConcertLog
export class ListItem {
  static render(props: Props) {
    let inputRef!: HTMLInputElement | undefined;

    const [isEditing, setIsEditing] = signal(false);

    function onEdit() {
      setIsEditing(true);
    }

    function onSave() {
      if (!inputRef) return;
      props.onUpdate(props.item, inputRef.value);
      setIsEditing(false);
    }

    function onCancel() {
      setIsEditing(false);
    }

    effect(() => {
      console.log("props.item: ", props.item);
    });

    onMount(() => {
      console.log(`ListItem ${props.item} Mounted`);
    });

    onCleanup(() => {
      console.log(`ListItem ${props.item} Cleanup`);
    });

    return (
      <li class="todo-item">
        {isEditing() ? (
          <input ref={ref => (inputRef = ref)} defaultValue={props.item} />
        ) : (
          <span>
            {props.item} - {props.randomNumber()}
          </span>
        )}
        <span onClick={() => props.onDelete(props.item)}>X</span>
        {isEditing() ? (
          <div>
            <button type="button" onClick={onSave}>
              SAVE
            </button>
            <button type="button" onClick={onCancel}>
              CANCEL
            </button>
          </div>
        ) : (
          <button type="button" onClick={onEdit}>
            EDIT
          </button>
        )}
      </li>
    );
  }
}
