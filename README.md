# mangle-standalone

Build standalone HTML files from a [Mangle](https://github.com/rexgarland/Mangle) doc. 

I built this to try incorporating reactive documents in my blog (WIP).

## Example

examples/cookies.mangle

```mangle
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
npm run build -- examples/cookies.mangle
```

Then open `dist/document.html`.

![](images/cookies.png)