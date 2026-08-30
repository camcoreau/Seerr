import Badge from '@app/components/Common/Badge';
import VersionStatus from '@app/components/Layout/VersionStatus';
import useClickOutside from '@app/hooks/useClickOutside';
import { Permission, useUser } from '@app/hooks/useUser';
import defineMessages from '@app/utils/defineMessages';
import { Transition } from '@headlessui/react';
import {
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  CogIcon,
  ExclamationTriangleIcon,
  EyeSlashIcon,
  FilmIcon,
  HomeIcon,
  LifebuoyIcon,
  PlayCircleIcon,
  SignalIcon,
  SparklesIcon,
  TvIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';

export const menuMessages = defineMessages('components.Layout.Sidebar', {
  dashboard: 'Discover',
  browsemovies: 'Movies',
  browsetv: 'Series',
  requests: 'Requests',
  blocklist: 'Blocklist',
  issues: 'Issues',
  users: 'Users',
  settings: 'Settings',
});

interface SidebarProps {
  open?: boolean;
  setClosed: () => void;
  pendingRequestsCount: number;
  openIssuesCount: number;
  revalidateIssueCount: () => void;
  revalidateRequestsCount: () => void;
}

interface SidebarLinkProps {
  href: string;
  svgIcon: React.ReactNode;
  messagesKey: keyof typeof menuMessages;
  activeRegExp: RegExp;
  as?: string;
  requiredPermission?: Permission | Permission[];
  permissionType?: 'and' | 'or';
  dataTestId?: string;
}

interface CamCoreLinkProps {
  href: string;
  label: string;
  svgIcon: React.ReactNode;
}

const SidebarLinks: SidebarLinkProps[] = [
  {
    href: '/',
    messagesKey: 'dashboard',
    svgIcon: <SparklesIcon className="mr-3 h-6 w-6" />,
    activeRegExp: /^\/(discover\/?)?$/,
  },
  {
    href: '/discover/movies',
    messagesKey: 'browsemovies',
    svgIcon: <FilmIcon className="mr-3 h-6 w-6" />,
    activeRegExp: /^\/discover\/movies$/,
  },
  {
    href: '/discover/tv',
    messagesKey: 'browsetv',
    svgIcon: <TvIcon className="mr-3 h-6 w-6" />,
    activeRegExp: /^\/discover\/tv$/,
  },
  {
    href: '/requests',
    messagesKey: 'requests',
    svgIcon: <ClockIcon className="mr-3 h-6 w-6" />,
    activeRegExp: /^\/requests/,
  },
  {
    href: '/blocklist',
    messagesKey: 'blocklist',
    svgIcon: <EyeSlashIcon className="mr-3 h-6 w-6" />,
    activeRegExp: /^\/blocklist/,
    requiredPermission: [
      Permission.MANAGE_BLOCKLIST,
      Permission.VIEW_BLOCKLIST,
    ],
    permissionType: 'or',
  },
  {
    href: '/issues',
    messagesKey: 'issues',
    svgIcon: <ExclamationTriangleIcon className="mr-3 h-6 w-6" />,
    activeRegExp: /^\/issues/,
    requiredPermission: [
      Permission.MANAGE_ISSUES,
      Permission.CREATE_ISSUES,
      Permission.VIEW_ISSUES,
    ],
    permissionType: 'or',
  },
  {
    href: '/users',
    messagesKey: 'users',
    svgIcon: <UsersIcon className="mr-3 h-6 w-6" />,
    activeRegExp: /^\/users/,
    requiredPermission: Permission.MANAGE_USERS,
    dataTestId: 'sidebar-menu-users',
  },
  {
    href: '/settings',
    messagesKey: 'settings',
    svgIcon: <CogIcon className="mr-3 h-6 w-6" />,
    activeRegExp: /^\/settings/,
    requiredPermission: Permission.ADMIN,
    dataTestId: 'sidebar-menu-settings',
  },
];

const CamCoreLinks: CamCoreLinkProps[] = [
  {
    href: 'https://camcore.au',
    label: 'CamCore Home',
    svgIcon: <HomeIcon className="mr-3 h-5 w-5" />,
  },
  {
    href: 'https://camcore.au/help-centre.html',
    label: 'Help Centre',
    svgIcon: <LifebuoyIcon className="mr-3 h-5 w-5" />,
  },
  {
    href: 'https://status.camcore.au',
    label: 'Service Status',
    svgIcon: <SignalIcon className="mr-3 h-5 w-5" />,
  },
  {
    href: 'https://plex.camcore.au',
    label: 'Cameron-Media',
    svgIcon: <PlayCircleIcon className="mr-3 h-5 w-5" />,
  },
  {
    href: 'https://camcore.au/support.html',
    label: 'Support Request',
    svgIcon: <LifebuoyIcon className="mr-3 h-5 w-5" />,
  },
];

const Sidebar = ({
  open,
  setClosed,
  pendingRequestsCount,
  openIssuesCount,
  revalidateIssueCount,
  revalidateRequestsCount,
}: SidebarProps) => {
  const navRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const intl = useIntl();
  const { hasPermission } = useUser();
  useClickOutside(navRef, () => setClosed());

  useEffect(() => {
    if (openIssuesCount) {
      revalidateIssueCount();
    }

    if (pendingRequestsCount) {
      revalidateRequestsCount();
    }
  }, [
    revalidateIssueCount,
    revalidateRequestsCount,
    pendingRequestsCount,
    openIssuesCount,
  ]);

  return (
    <>
      <div className="lg:hidden">
        <Transition as={Fragment} show={open}>
          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as="div"
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0">
                <div className="absolute inset-0 bg-gray-950 opacity-90" />
              </div>
            </Transition.Child>
            <Transition.Child
              as="div"
              enter="transition-transform ease-in-out duration-300"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition-transform ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <>
                <div
                  className="sidebar relative flex h-full w-full max-w-xs flex-1 flex-col border-r border-cyan-300/10"
                  style={{ backgroundColor: '#07162f' }}
                >
                  <div className="sidebar-close-button absolute right-0 -mr-14 p-1">
                    <button
                      className="flex h-12 w-12 items-center justify-center rounded-full focus:bg-white/10 focus:outline-none"
                      aria-label="Close sidebar"
                      onClick={() => setClosed()}
                    >
                      <XMarkIcon className="h-6 w-6 text-white" />
                    </button>
                  </div>
                  <div
                    ref={navRef}
                    className="flex flex-1 flex-col overflow-y-auto pb-8 pt-4 sm:pb-4"
                  >
                    <div className="flex flex-shrink-0 items-center px-2">
                      <span className="w-full px-4 text-xl text-gray-50">
                        <Link href="/" className="relative block h-24 w-64">
                          <Image src="/logo_full.svg" alt="CamCore" fill />
                        </Link>
                      </span>
                    </div>
                    <nav className="mt-7 flex-1 px-4">
                      <div className="space-y-3">
                        {SidebarLinks.filter((link) =>
                          link.requiredPermission
                            ? hasPermission(link.requiredPermission, {
                                type: link.permissionType ?? 'and',
                              })
                            : true
                        ).map((sidebarLink) => {
                          return (
                            <Link
                              key={`mobile-${sidebarLink.messagesKey}`}
                              href={sidebarLink.href}
                              as={sidebarLink.as}
                              onClick={() => setClosed()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setClosed();
                                }
                              }}
                              role="button"
                              tabIndex={0}
                              className={`flex items-center rounded-lg px-3 py-2 text-base font-medium leading-6 transition duration-150 ease-in-out focus:outline-none ${
                                router.pathname.match(sidebarLink.activeRegExp)
                                  ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-cyan-950/30 hover:from-sky-400 hover:to-cyan-400'
                                  : 'text-slate-100 hover:bg-white/10 focus:bg-white/10'
                              } `}
                              data-testid={`${sidebarLink.dataTestId}-mobile`}
                            >
                              {sidebarLink.svgIcon}
                              {intl.formatMessage(
                                menuMessages[sidebarLink.messagesKey]
                              )}
                            </Link>
                          );
                        })}
                      </div>

                      <div className="mt-7 border-t border-white/10 pt-5">
                        <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-camcore-coral-light">
                          CamCore
                        </p>
                        <div className="space-y-1.5">
                          {CamCoreLinks.map((camCoreLink) => (
                            <a
                              key={`mobile-${camCoreLink.label}`}
                              href={camCoreLink.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setClosed()}
                              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition duration-150 ease-in-out hover:bg-white/10 hover:text-white focus:bg-white/10 focus:outline-none"
                            >
                              {camCoreLink.svgIcon}
                              <span>{camCoreLink.label}</span>
                              <ArrowTopRightOnSquareIcon className="ml-auto h-4 w-4 text-slate-400" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </nav>
                    {hasPermission(Permission.ADMIN) && (
                      <div className="px-2 pt-4">
                        <VersionStatus onClick={() => setClosed()} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-14 flex-shrink-0">
                  {/* <!-- Force sidebar to shrink to fit close icon --> */}
                </div>
              </>
            </Transition.Child>
          </div>
        </Transition>
      </div>

      <div className="fixed bottom-0 left-0 top-0 z-30 hidden lg:flex lg:flex-shrink-0">
        <div
          className="sidebar flex w-64 flex-col border-r border-cyan-300/10"
          style={{ backgroundColor: '#07162f' }}
        >
          <div className="flex h-0 flex-1 flex-col">
            <div className="flex flex-1 flex-col overflow-y-auto pb-4">
              <div className="flex flex-shrink-0 items-center">
                <span className="w-full px-4 py-2 text-2xl text-gray-50">
                  <Link href="/" className="relative block h-24">
                    <Image
                      src="/logo_full.svg"
                      alt="CamCore"
                      fill
                      loading="eager"
                    />
                  </Link>
                </span>
              </div>
              <nav className="mt-6 flex-1 px-4">
                <div className="space-y-3">
                  {SidebarLinks.filter((link) =>
                    link.requiredPermission
                      ? hasPermission(link.requiredPermission, {
                          type: link.permissionType ?? 'and',
                        })
                      : true
                  ).map((sidebarLink) => {
                    return (
                      <Link
                        key={`desktop-${sidebarLink.messagesKey}`}
                        href={sidebarLink.href}
                        as={sidebarLink.as}
                        className={`group flex items-center rounded-lg px-3 py-2 text-lg font-medium leading-6 transition duration-150 ease-in-out focus:outline-none ${
                          router.pathname.match(sidebarLink.activeRegExp)
                            ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-cyan-950/30 hover:from-sky-400 hover:to-cyan-400'
                            : 'text-slate-100 hover:bg-white/10 focus:bg-white/10'
                        } `}
                        data-testid={sidebarLink.dataTestId}
                      >
                        {sidebarLink.svgIcon}
                        {intl.formatMessage(
                          menuMessages[sidebarLink.messagesKey]
                        )}
                        {sidebarLink.messagesKey === 'requests' &&
                          pendingRequestsCount > 0 &&
                          hasPermission(Permission.MANAGE_REQUESTS) && (
                            <div className="ml-auto flex">
                              <Badge
                                className={`rounded-md bg-gradient-to-r ${
                                  router.pathname.match(
                                    sidebarLink.activeRegExp
                                  )
                                    ? 'border-cyan-400 from-sky-600 to-cyan-600'
                                    : 'border-sky-400 from-sky-500 to-cyan-500'
                                }`}
                              >
                                {pendingRequestsCount}
                              </Badge>
                            </div>
                          )}
                        {sidebarLink.messagesKey === 'issues' &&
                          openIssuesCount > 0 &&
                          hasPermission(Permission.MANAGE_ISSUES) && (
                            <div className="ml-auto flex">
                              <Badge
                                className={`rounded-md bg-gradient-to-r ${
                                  router.pathname.match(
                                    sidebarLink.activeRegExp
                                  )
                                    ? 'border-cyan-400 from-sky-600 to-cyan-600'
                                    : 'border-sky-400 from-sky-500 to-cyan-500'
                                }`}
                              >
                                {openIssuesCount}
                              </Badge>
                            </div>
                          )}
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-7 border-t border-white/10 pt-5">
                  <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-camcore-coral-light">
                    CamCore
                  </p>
                  <div className="space-y-1.5">
                    {CamCoreLinks.map((camCoreLink) => (
                      <a
                        key={`desktop-${camCoreLink.label}`}
                        href={camCoreLink.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition duration-150 ease-in-out hover:bg-white/10 hover:text-white focus:bg-white/10 focus:outline-none"
                      >
                        {camCoreLink.svgIcon}
                        <span>{camCoreLink.label}</span>
                        <ArrowTopRightOnSquareIcon className="ml-auto h-4 w-4 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              </nav>
              {hasPermission(Permission.ADMIN) && (
                <div className="px-2 pt-4">
                  <VersionStatus />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
