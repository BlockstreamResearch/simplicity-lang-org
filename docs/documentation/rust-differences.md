# Differences between Rust and SimplicityHL

We've emphasized that SimplicityHL syntax is directly based on Rust and should be familiar to Rust programmers. Here, we describe some differences between the two languages, ways that SimplicityHL is *not* the same as Rust.

* **No mutable variables**: All SimplicityHL variables are immutable. There is no way to declare a variable as mutable or to change its value after it's been declared.

* **No infix and unary operators**: Currently, SimplicityHL does not support common infix and unary operators such as `!=`, `==`, `<=`, `>=`, `+`, `-`, `*`, `/`, `&`, `|`, `^`, `!`, and others that are found in Rust and in other languages whose syntax descends from C's. Instead, each of these operations requires an explicit call to an appropriate <a href="/documentation/jets">jet</a> to perform the comparison. (It may be possible for a future version of the SimplicityHL compiler to support these notations as syntactic sugar for the corresponding jet calls.) For example, code that might look like

```rust
  if (counter3 != threshold) {
      assert!(0);
  }
```

in other languages is written in current versions of SimplicityHL as

```rust
  assert!(jet::eq_8(counter3, threshold));
```

Code that might look like

```rust
   let x: u8 = 17;
   let y: u8 = x + 1;
```

in Rust is written in current SimplicityHL as

```rust
   let x: u8 = 17;
   let (carry, y): (bool, u8) = jet::add_8(x, 1);
```

(as the `add_8` jet returns an explicit carry flag indicating whether the addition caused an integer overflow; the carry flag value is required to be assigned somewhere).

* **No unbounded loops or recursion**: Simplicity is intentionally not Turing-complete, and SimplicityHL accordingly does not have a `while` loop or a `for` loop in its native syntax. Nor is a function permitted to call itself recursively. For bounded loops, there is a built-in function called `for_while` which can execute a code block up to a specified maximum number of times (limited to 65536 iterations per `for_while` loop). SimplicityHL also offers `fold` and `array_fold` functions to help with some tasks that could traditionally be performed with iteration or recursion in other languages.

* **No `if` statement**: SimplicityHL does not include an `if` statement. Conditional branching is performed with the `match` keyword (sometimes by `match`ing on a boolean value returned from a jet or function, or on the constructor of a value passed in a witness input).

* **No run-time I/O or interactivity**: Simplicity's execution model allows a witness to be provided at runtime as a form of input to the program. There is no provision for interacting with users or services, or for reading other data from elsewhere, during the program's execution. A Simplicity program is also expected to provide a yes-or-no answer about whether to approve a proposed blockchain transaction, optionally on the basis of data optionally supplied via a witness. The program is not able to give other answers, output, or side effects. Thus, there are no functions to perform any form of file, network, or terminal I/O.

* **Simpler type system**: SimplicityHL's type system is much simpler than Rust's. It isn't possible to declare traits or implementations of traits.
