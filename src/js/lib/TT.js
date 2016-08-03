import Application from './Application';
import Scope from './Scope';
import EventEmitter from './EventEmitter';
import Module from './Module';
import Utils from './Utils';

export default {
  Application: Application,
  Scope: Scope,
  Module: Module,
  EventEmitter: EventEmitter,
  Component: Utils.Component,
  createDecorator: Utils.Decorator
};
