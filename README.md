# ConcertJS
Conduct complex UIs with ease. Code in Concert, creating a symphony of fine-grained reactivity and control.


### Framework Features

- Signals based component state management
- Decorator driven mounting/routing/context/global-state management
- JSX with inline control flow


### Elements of Functionality

- sliteRuntime(): Initializes application
- @Root() decorator: Identifies application component that is mounted to DOM at root
- @With() decorator: Can be applied at any level of the component tree, creates a context for each Provider passed to it
- ConcertRouter provider: Provides context for the ConcertRouter
- ConcertRouteSlot component: Routed content injection slot
- @Inject() decorator: Injects each Provider passed to it into the associated component. Component must be within a context. Instance is passed as second argument containing all injected Contexts.
- @Route decorator: Identifies a routed page. Accepts path, default props object or callback supporting async default props fetching, and authorization guards/middleware
- signal() utility: Signals based reactivity similar to SolidJS
- memo() utility: Computed signals based reactivity similar to SolidJS
- effect() utility: Signals based reactivity similar to SolidJS
- pending={}/fallback={} DOM attr: Functions similarly to a Suspense component but applied to HTML element
- for={} DOM attr: Functions similarly to SolidJS <For /> built-in but applied to HTML element, like VueJS
- switch={}/case={} DOM attr: Conditional logic in JSX, removing need for ternary blocks in JSX
- if={}/else-if={}/else={} DOM attr: Conditional logic in JSX, removing need for ternary blocks in JSX


### Value Proposition
- The best developer experience no matter which framework you're coming from
- Easily extensible
- Type safety
- Less lines, less configurations, less mistakes
- Blazingly fast
- No virtual DOM, fine-grained reactivity instead
- Small bundle sizes due to compile time front-loading


### Example Style

```typescript jsx
import { ConcertRouter, signal, memo, effect, Inject, Root, Route, With } from 'slitejs';

// Mock Service
function ItemsService() {
  const items = [
    'Some Item',
    'Another Item',
    'A Third Item'
  ];
  
  return {
    fetchAll: () => new Promise((resolve) => {
      resolve(items);
    }),
    fetchItem: (_item: string) => new Promise((resolve) => {
      resolve(items.find((item) => item === _item));
    }),
  }
}

function Counter(props) {
  const [count, setCount] = signal(props.defaultCount);
  const double = memo(() => count() * 2);
  
  effect(() => {
    props.onCountChange(count());
  });

  setInterval(() => setCount((prev) => prev + 1), 1000);

  return (
    <ul>
      <li>{count()}</li>
      <li>{double()}</li>
    </ul>
  );
}

function Navigation() {
  return (
    <ul>
      <Link to="/">Home</Link>
      <Link to="/dashboard">Dashboard</Link>
    </ul>
  );
}

@Inject(ConcertRouter)
function Footer(props, { router }) {
  return (
    <div>
      <button onClick={() => router.navigate('/donate')}>Click to Donate</button>
    </div>
  );
}

@Route('/donate')
function Donate() {
  return (
    <div>
    </div>
  );
}

@Route('/dashboard', { defaultCount: 1 }, [AdminGuard, UserGuard])
function Dashboard(props) {
  const [count, setCount] = signal(props.defaultCount);
  
  return (
    <div>
      <Counter defaultCount={props.defaultCount} onCountChange={setCount} />
      <div switch={count()}>
        <div case={1}>Count is 1</div>
        <div case={2}>Count is 2</div>
        <div case={3}>Count is 3</div>
        <div case>No case matched</div>
      </div>
    </div>
  );
}

function getListItems(): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([1, 2, 3, 4]), 100);
  });
}

@Route('/', async (route, { itemsService }) => ({
  listItems: await itemsService.fetchAll()
}))
@Inject(ItemsService)
function Home(props, instance) {
  return (
    <div pending={<div>Is Loading</div>} fallback={<div>Failed</div>}>
      <div for={props.listItems}>
        {(item) => <div onClick={() => instance.itemsService.fetchItem(item)}>{item}</div>}
      </div>
    </div>
  );
}

@Root()
@With(ItemsService, ConcertRouter)
function App() {
  return (
    <div>
      <Navigation />
      <ConcertRouteSlot />
      <Footer />
    </div>
  );
}

render('#app', [RegisterGlobals]);
```
