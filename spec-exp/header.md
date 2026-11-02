The `did:webvh` DID Method<br>Experimental: `did:webvh` on VH-Log
==================

![did:webvh Logo](https://raw.githubusercontent.com/decentralized-identity/didwebvh/refs/heads/main/didwebvh.jpg)

**Specification Status:** EXPERIMENTAL

::: warning Experimental Version

This is an **experimental** version of the `did:webvh` specification. It
redefines `did:webvh` as a [[ref: specialisation]] of the [Verifiable History
Log (VH-Log)](https://swcurran.github.io/VH-Log/) specification, and depends
on it: the log format, its verification, [[ref: witnesses]], [[ref: watchers]]
and the transport rules are defined in VH-Log and are not repeated here. This
document defines only what is specific to `did:webvh`.

VH-Log is itself a pre-draft. This version exists to test whether `did:webvh`
can be defined as a VH-Log specialisation without changing existing
`did:webvh` DIDs. **Do not implement against this version.** The current
`did:webvh` specification is [v1.0](../v1.0).

:::

**Current Specification:** [v1.0](../v1.0)

**Editors Draft:** [next](../next)

**Depends On:**
~ [VH-Log](https://swcurran.github.io/VH-Log/) — the Verifiable History Log
  mechanism this version specialises ([source](https://github.com/swcurran/VH-Log))

**Related Specifications:**
~ [did:vh](https://swcurran.github.io/didvh/) — the location-independent
  sibling of `did:webvh`, also a VH-Log specialisation

**Source of Latest Draft:**
  [https://github.com/decentralized-identity/didwebvh](https://github.com/decentralized-identity/didwebvh)

**Information Site:**
  [https://didwebvh.info/](https://didwebvh.info/)

**Editors:**
~ [Stephen Curran](https://github.com/swcurran)
~ [John Jordan, BC Gov](https://github.com/jljordan42)
~ [Andrew Whitehead](https://github.com/andrewwhitehead)
~ [Brian Richter](https://github.com/brianorwhatever)
~ [Michel Sahli](https://github.com/bj-ms)
~ [Martina Kolpondinos](https://github.com/martipos)
~ [Dmitri Zagdulin](https://github.com/dmitrizagidulin)
~ [Alexander Shenshin](https://github.com/AlexanderShenshin)

**Participate:**
~ [GitHub repo](https://github.com/decentralized-identity/didwebvh)
~ [File a bug](https://github.com/decentralized-identity/didwebvh/issues)
~ [Commit history](https://github.com/decentralized-identity/didwebvh/commits/main)

------------------------------------
