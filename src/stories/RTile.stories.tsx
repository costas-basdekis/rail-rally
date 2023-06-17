// noinspection JSUnusedGlobalSymbols

import React from "react";
import type {Meta, StoryObj} from '@storybook/react';

import {RTile} from "@/components";
import {connectionDirections, Tile} from "@/rails";

export default {
  title: 'Components/RTile',
  component: RTile,
} as Meta<typeof RTile>;

type Story = StoryObj<typeof RTile>;

const render = (props: Partial<RTile["props"]>) => {
  return (
    <svg width={50} height={50}>
      <RTile {...props} />
    </svg>
  )
};

export const Empty: Story = {
  render,
  args: {
    tile: Tile.fromConnections([], []),
  },
};

export const Cross: Story = {
  render,
  args: {
    tile: Tile.fromConnections([
      ["bottom", "top"],
      ["left", "right"],
    ], []),
  },
};

export const DiagonalCross: Story = {
  render,
  args: {
    tile: Tile.fromConnections([
      ["top-left", "bottom-right"],
      ["top-right", "bottom-left"],
    ], []),
  },
};

export const OddAngles: Story = {
  render,
  args: {
    tile: Tile.fromConnections([
      ["top", "bottom-left"],
      ["top", "bottom-right"],
      ["bottom", "top-left"],
      ["bottom", "top-right"],
      ["left", "top-right"],
      ["left", "bottom-right"],
      ["right", "bottom-left"],
      ["right", "top-left"],
    ], []),
  },
};

export const All: Story = {
  render,
  args: {
    tile: Tile.fromConnections([
      ["bottom", "top"],
      ["left", "right"],
      ["top-left", "bottom-right"],
      ["top-right", "bottom-left"],
      ["top", "bottom-left"],
      ["top", "bottom-right"],
      ["bottom", "top-left"],
      ["bottom", "top-right"],
      ["left", "top-right"],
      ["left", "bottom-right"],
      ["right", "bottom-left"],
      ["right", "top-left"],
    ], []),
  },
};

export const AllDeadEnd: Story = {
  render,
  args: {
    tile: Tile.fromConnections([], connectionDirections.items),
  },
};
