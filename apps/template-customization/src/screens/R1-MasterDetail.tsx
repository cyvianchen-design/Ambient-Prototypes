import React, { useState } from "react";
import { CustomizeLayout, NavSection } from "../components/CustomizeLayout";
import { MasterDetailView } from "../components/MasterDetailView";

export default function R1MasterDetail() {
  const [activeSection, setActiveSection] = useState<NavSection>("my-templates");
  const [selectedTemplate, setSelectedTemplate] = useState("soap-note");

  return (
    <CustomizeLayout
      activeSection={activeSection}
      selectedTemplate={selectedTemplate}
      onSectionChange={setActiveSection}
      onTemplateChange={setSelectedTemplate}
    >
      <MasterDetailView
        key={`${activeSection}-${selectedTemplate}`}
        mode={activeSection === "my-templates" ? "my" : "shared"}
      />
    </CustomizeLayout>
  );
}
