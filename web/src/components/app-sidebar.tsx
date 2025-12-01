import * as React from "react";
import { Link } from "@tanstack/react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  generateTestCertificates,
  revokeRandomCertificates,
} from "@/lib/test-data.ts";
import { useState } from "react";
import { GenerateTestDataModal } from "@/components/generate-test-data-modal.tsx";

const data = {
  navMain: [
    {
      title: "Normal User",
      url: "#",
      items: [
        {
          title: "Counter",
          url: "/user/counter",
        },
      ],
    },
    {
      title: "Certificates",
      url: "#",
      items: [
        {
          title: "Upload Certificate",
          url: "/certs/new",
        },
        {
          title: "View Certificate",
          url: "/certs/view",
        },
        {
          title: "Revoke Certificate",
          url: "/certs/revoke",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [showModal, setShowModal] = useState(false);

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium text-lg">Nonce Sense</span>
                  <span className="">Distributed TLS Certificate POC</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link to={item.url} className="font-medium">
                    {item.title}
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                    {item.items.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild>
                          <Link to={item.url}>{item.title}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <button onClick={() => setShowModal(true)}>Generate Test Data</button>

        <GenerateTestDataModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={async () => {
            await generateTestCertificates(20);
            await revokeRandomCertificates(5);
            setShowModal(false);
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
