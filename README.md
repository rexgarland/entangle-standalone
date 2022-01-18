# entangle-standalone

Build standalone HTML files from an [Entangle](https://github.com/rexgarland/Entangle) doc. 

I built this to try incorporating reactive documents in my blog (WIP).

## Example

examples/cookies.entangle

```entangle
# Cookies

If you eat `${cookies} cookies`, you will consume `${calories} calories`, or `${percent}%` of your recommended daily intake.

---

cookies:
  class: TKAdjustableNumber
  min: 0
  max: 10
  initial: 3
percent:
  format: "%.0f"

---

update = ({cookies}) ->
  calories: cookies*50,
  percent: cookies*2.38
```

Compile it with...

```shell
npm install
npm run build -- examples/cookies.entangle
```

Then open `dist/document.html`.

![](images/cookies.png)