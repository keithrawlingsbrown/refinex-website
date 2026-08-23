---
title: "When the Data Center Is in a War Zone"
date: "2026-04-14"
description: "On March 1, banking apps went offline across the UAE. The cause was not a software bug. Buildings that house cloud infrastructure were physically damaged."
slug: "when-data-center-in-war-zone"
tags: ['aws', 'spot', 'geopolitical-risk', 'signal-intelligence']
published: true
---

On March 1, 2026, banking apps went offline across the UAE. Careem stopped working. Emirates NBD was unreachable. Payment systems that millions of people depend on daily went dark. The cause was not a software bug or a network fault. Buildings that house cloud infrastructure were physically damaged.

For the engineering teams responsible for those services, the post-mortem question is not what they should have built differently. It is what information they should have had.

## What happened

Physical strikes damaged AWS data centers in the UAE and Bahrain on March 1. Two of three availability zones in ME-CENTRAL-1 were impacted simultaneously. The standard multi-AZ resilience model, which protects against hardware failures and localized outages, did not protect against concurrent physical damage to multiple facilities in the same region.

Gulf companies including Careem, Emirates NBD, First Abu Dhabi Bank, and Alaan experienced service disruptions. For the engineers running those services, the outage was not an abstract infrastructure event. It was a real disruption to real people in the middle of an active military conflict.

## What the signal data showed

In the 48 hours before the first strikes, suppression rates in ME-CENTRAL-1 were already diverging from their 30-day baseline. The confidence band was degrading before the physical damage occurred.

That divergence is the gap between a headline and a signal. The headline arrives after the damage. The signal was there before.

## Why multi-AZ was not the failure

Multi-AZ deployment was the correct architecture on February 27. It protects against the failures it was designed for: hardware faults, power issues, network partitions within a single facility. It was never designed to protect against simultaneous physical damage to multiple facilities in the same metropolitan area.

The engineering teams that deployed in ME-CENTRAL-1 did not make bad decisions. The threat model changed without warning. Their architecture did not fail them. The information layer failed them.

## What this means for spot workloads

The confidence band for ME-CENTRAL-1 has been suppressed for 43 days. The cause code is "sustained infrastructure damage," not "capacity management." Those two classifications have fundamentally different recovery profiles. One resolves in hours. The other resolves when physical infrastructure is rebuilt.

Simultaneously, US-EAST-1 and EU-WEST-1 are both showing elevated suppression deltas versus their 30-day baselines. This is displacement demand. Every team that migrated workloads out of ME regions landed in the same destination regions. That demand compression affects spot capacity and interruption rates for everyone in those regions, including teams with no connection to the conflict.

## What to watch

The ceasefire announced April 8 did not restore the confidence band. Negotiations in Islamabad collapsed April 12. A naval blockade is now active. The ceasefire formally expires April 22 with no agreement in place.

The suppression log is public at refinex.io/transparency. A diplomatic announcement and a recovering confidence band are two different things. They have not moved together during this conflict. There is no reason to expect they will on April 22 either.

The data does not belong to any government. It belongs to the engineers making decisions based on it.

[View the live signal log](https://www.refinex.io/transparency)

---

*Keith Brown is founder of RefineX.*
