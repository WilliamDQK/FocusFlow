import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '../components/shell/AppShell'

const DashboardPage = lazy(() => import('../pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const FocusPage = lazy(() => import('../pages/FocusPage').then((module) => ({ default: module.FocusPage })))
const HistoryPage = lazy(() => import('../pages/HistoryPage').then((module) => ({ default: module.HistoryPage })))
const MemoPage = lazy(() => import('../pages/MemoPage').then((module) => ({ default: module.MemoPage })))
const SettingsPage = lazy(() => import('../pages/SettingsPage').then((module) => ({ default: module.SettingsPage })))
const StatisticsPage = lazy(() => import('../pages/StatisticsPage').then((module) => ({ default: module.StatisticsPage })))
const TasksPage = lazy(() => import('../pages/TasksPage').then((module) => ({ default: module.TasksPage })))
const TodayPage = lazy(() => import('../pages/TodayPage').then((module) => ({ default: module.TodayPage })))

function page(node: ReactNode) { return <Suspense fallback={<div className="route-loading"><span /></div>}>{node}</Suspense> }

export const router = createBrowserRouter([{ path: '/', element: <AppShell />, children: [
  { index: true, element: page(<DashboardPage />) }, { path: 'today', element: page(<TodayPage />) },
  { path: 'tasks', element: page(<TasksPage />) }, { path: 'focus', element: page(<FocusPage />) },
  { path: 'statistics', element: page(<StatisticsPage />) }, { path: 'memo', element: page(<MemoPage />) },
  { path: 'history', element: page(<HistoryPage />) }, { path: 'settings', element: page(<SettingsPage />) },
  { path: '*', element: <Navigate to="/" replace /> },
]}])
