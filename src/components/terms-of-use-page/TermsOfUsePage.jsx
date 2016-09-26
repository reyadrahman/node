import Header from '../header/Header.jsx';
import React from 'react';

const TermsOfUsePage = React.createClass({

    render() {
        const { className, i18n, i18n: { strings: { termsOfUsePage: strings } } } = this.props;

        return (
            <div className="terms-of-use-page-comp">
                <Header i18n={i18n} />
                <div className="content">
                    <h1>Terms of use</h1>
        <p><em> Last updated September 27, 2016</em> 
        </p>
        <p>This Deepiks Customer Agreement (this &quot;Agreement&quot;) contains the terms and conditions that govern your access to and use of the Service Offerings (as defined below) and is an agreement between Deepiks SAS (“Deepiks,” “we,” “us,” or
          “our”) and you or the entity you represent (“you“). This Agreement takes effect when you click an “I Accept” button or check box presented with these terms or, if earlier, when you use any of the Service Offerings (the “Effective Date“). You
          represent to us that you are lawfully able to enter into contracts (e.g., you are not a minor). If you are entering into this Agreement for an entity, such as the company you work for, you represent to us that you have legal authority to bind
          that entity. Please see Section 14 for definitions of certain capitalized terms used in this Agreement.</p>
        <h2 id="1-use-of-the-service-offerings-">1. Use of the Service Offerings.</h2>
        <h3 id="1-1-generally-">1.1 Generally.</h3>
        <p>You may access and use the Service Offerings in accordance with this Agreement. Service Level Agreements may apply to certain Service Offerings. You will adhere to all laws, rules, and regulations applicable to your use of the Service Offerings.</p>
        <h3 id="1-2-your-account-">1.2 Your Account.</h3>
        <p>To access the Services, you must create a Deepiks account associated with a valid e-mail address. Unless explicitly permitted by the Service Terms, you may only create one account per email address. You are responsible for all activities that
          occur under your account, regardless of whether the activities are undertaken by you, your employees or a third party (including your contractors or agents) and, except to the extent caused by our breach of this Agreement, we and our affiliates
          are not responsible for unauthorized access to your account. You will contact us immediately if you believe an unauthorized third party may be using your account or if your account information is lost or stolen. You may terminate your account
          and this Agreement at any time in accordance with Section 7.</p>
        <h3 id="1-3-third-party-content-">1.3 Third Party Content.</h3>
        <p>Third Party Content, such as software applications provided by third parties, may be made available directly to you by other companies or individuals under separate terms and conditions, including separate fees and charges. Because we may not
          have tested or screened the Third Party Content, your use of any Third Party Content is at your sole risk.</p>
        <h2 id="2-changes-">2. Changes.</h2>
        <h3 id="2-1-to-the-service-offerings-">2.1 To the Service Offerings.</h3>
        <p>We may change, discontinue, or deprecate any of the Service Offerings (including the Service Offerings as a whole) or change or remove features or functionality of the Service Offerings from time to time. We will notify you of any material change
          to or discontinuation of the Service Offerings.</p>
        <h3 id="2-2-to-the-service-level-agreements-">2.2 To the Service Level Agreements.</h3>
        <p>We may change, discontinue or add Service Level Agreements from time to time.</p>
        <h2 id="3-security-">3. Security.</h2>
        <h3 id="3-1-Deepiks-security-">3.1 Deepiks Security.</h3>
        <p>Without limiting Section 10 or your obligations under Section 4.2, we will implement reasonable and appropriate measures designed to help you secure Your Content against accidental or unlawful loss, access or disclosure.</p>
        <h2 id="4-your-responsibilities">4. Your Responsibilities</h2>
        <h3 id="4-1-your-content-">4.1 Your Content.</h3>
        <p>You are solely responsible for the development, content, operation, maintenance, and use of Your Content. For example, you are solely responsible for:</p>
        <p>(a) compliance of Your Content with the law;</p>
        <p>(b) any claims relating to Your Content; and</p>
        <p>(c) properly handling and processing notices sent to you (or any of your affiliates) by any person claiming that Your Content violate such person’s rights.</p>
        <h3 id="4-2-other-security-and-backup-">4.2 Other Security and Backup.</h3>
        <p>You are responsible for properly configuring and using the Service Offerings and taking your own steps to maintain appropriate security, protection and backup of Your Content, which may include the use of encryption technology to protect Your
          Content from unauthorized access and routine archiving Your Content. Deepiks log-in credentials and private keys generated by the Services are for your internal use only and you may not sell, transfer or sublicense them to any other entity
          or person, except that you may disclose your private key to your agents and subcontractors performing work on your behalf.</p>
        <h3 id="4-3-end-user-violations-">4.3 End User Violations.</h3>
        <p>You will be deemed to have taken any action that you permit, assist or facilitate any person or entity to take related to this Agreement, Your Content or use of the Service Offerings. You are responsible for End Users’ use of Your Content and
          the Service Offerings. You will ensure that all End Users comply with your obligations under this Agreement and that the terms of your agreement with each End User are consistent with this Agreement. If you become aware of any violation of your
          obligations under this Agreement by an End User, you will immediately terminate such End User’s access to Your Content and the Service Offerings.</p>
        <h3 id="4-4-end-user-support-">4.4 End User Support.</h3>
        <p>You are responsible for providing customer service (if any) to End Users. We do not provide any support or services to End Users unless we have a separate agreement with you or an End User obligating us to provide support or services.</p>
        <h2 id="5-fees-and-payment">5. Fees and Payment</h2>
        <h3 id="5-1-service-fees-">5.1. Service Fees.</h3>
        <p>Subscriptions to paid Services are available on monthly and yearly subscription plans. Information on the subscription options and charges for all paid Services is available at
          <a href="pricing">
            <a href="http://www.Deepiks.com/pricing">http://www.Deepiks.com/pricing</a> 
          </a> . Your subscriptions will be automatically renewed at the end of each subscription period unless you inform us that you do not wish to renew the subscription. All subscription fees are payable in advance at the beginning of the subscription
          period.</p>
        <p>All amounts payable under this Agreement will be made without setoff or counterclaim, and without any deduction or withholding. Fees and charges for any new Service or new feature of a Service will be effective when we post updated fees and charges
          on the Deepiks Site unless we expressly state otherwise in a notice. We may increase or add new fees and charges for any existing Services by giving you at least 30 days’ advance notice. We may charge you interest at the rate of 1.5% per month
          (or the highest rate permitted by law, if less) on all late payments.</p>
        <h3 id="5-2-taxes-">5.2 Taxes.</h3>
        <p>All fees and charges payable by you are exclusive of applicable taxes and duties, including VAT and applicable sales tax. You will provide us any information we reasonably request to determine whether we are obligated to collect VAT from you,
          including your VAT identification number. If any deduction or withholding is required by law, you will notify us and will pay us any additional amounts necessary to ensure that the net amount that we receive, after any deduction and withholding,
          equals the amount we would have received if no deduction or withholding had been required. Additionally, you will provide us with documentation showing that the withheld and deducted amounts have been paid to the relevant taxing authority.</p>
        <h2 id="6-temporary-suspension">6. Temporary Suspension</h2>
        <h3 id="6-1-generally-">6.1 Generally.</h3>
        <p>We may suspend your or any End User’s right to access or use any portion or all of the Service Offerings immediately upon notice to you if we determine:</p>
        <p>(a) your or an End User’s use of or registration for the Service Offerings (i) poses a security risk to the Service Offerings or any third party, (ii) may adversely impact the Service Offerings or the systems or Content of any other Deepiks customer,
          (iii) may subject us, our affiliates, or any third party to liability, or (iv) may be fraudulent;</p>
        <p>(b) you are, or any End User is, in breach of this Agreement, including if you are delinquent on your payment obligations for more than 15 days; or</p>
        <p>(c) you have ceased to operate in the ordinary course, made an assignment for the benefit of creditors or similar disposition of your assets, or become the subject of any bankruptcy, reorganization, liquidation, dissolution or similar proceeding.</p>
        <h3 id="6-2-effect-of-suspension-">6.2 Effect of Suspension.</h3>
        <p>If we suspend your right to access or use any portion or all of the Service Offerings:</p>
        <p>(a) you remain responsible for all fees and charges you have incurred through the date of suspension;</p>
        <p>(b) you remain responsible for any applicable fees and charges for any Service Offerings to which you continue to have access, as well as applicable data storage fees and charges, and fees and charges for in-process tasks completed after the date
          of suspension;</p>
        <p>(c) you will not be entitled to any service credits under the Service Level Agreements for any period of suspension; and</p>
        <p>(d) we will not erase any of Your Content as a result of your suspension, except as specified elsewhere in this Agreement.</p>
        <p>Our right to suspend your or any End User’s right to access or use the Service Offerings is in addition to our right to terminate this Agreement pursuant to Section 7.2.</p>
        <h2 id="7-term-termination">7. Term; Termination</h2>
        <h3 id="7-1-term-">7.1.Term.</h3>
        <p>The term of this Agreement will commence on the Effective Date and will remain in effect until terminated by you or us in accordance with Section 7.2.</p>
        <h3 id="7-2-termination-">7.2 Termination.</h3>
        <p>(a) Termination for Convenience. You may terminate this Agreement for any reason by (i) providing us notice and (ii) closing your account for all Services for which we provide an account closing mechanism. We may terminate this Agreement for any
          reason by providing you 30 days advance notice.</p>
        <p>(b) Termination for Cause.</p>
        <p>(i) By Either Party. Either party may terminate this Agreement for cause upon 30 days advance notice to the other party if there is any material default or breach of this Agreement by the other party, unless the defaulting party has cured the
          material default or breach within the 30 day notice period.</p>
        <p>(ii) By Us. We may also terminate this Agreement immediately upon notice to you (A) for cause, if any act or omission by you or any End User results in a suspension described in Section 6.1, (B) if our relationship with a third party partner who
          provides software or other technology we use to provide the Service Offerings expires, terminates or requires us to change the way we provide the software or other technology as part of the Services, (c) if we believe providing the Services
          could create a substantial economic or technical burden or material security risk for us, (D) in order to comply with the law or requests of governmental entities, or (E) if we determine use of the Service Offerings by you or any End Users or
          our provision of any of the Services to you or any End Users has become impractical or unfeasible for any legal or regulatory reason.</p>
        <h3 id="7-3-effect-of-termination-">7.3. Effect of Termination.</h3>
        <p>(a) Generally. Upon any termination of this Agreement:</p>
        <p>(i) all your rights under this Agreement immediately terminate;</p>
        <p>(ii) you remain responsible for all fees and charges you have incurred through the date of termination, until the end of the current subscription period;</p>
        <p>(iii) you will immediately return or, if instructed by us, destroy all Deepiks Content in your possession; and</p>
        <p>(iv) Sections 4.1, 5.2, 7.3, 8 (except the license granted to you in Section 8.4), 9, 10, 11, 13 and 14 will continue to apply in accordance with their terms.</p>
        <p>(b) Post-Termination Assistance. Unless we terminate your use of the Service Offerings pursuant to Section 7.2(b), during the 30 days following termination:</p>
        <p>(i) we will not erase any of Your Content as a result of the termination;</p>
        <p>(ii) you may retrieve Your Content from the Services only if you have paid any charges for any post-termination use of the Service Offerings and all other amounts due; and</p>
        <p>(iii) we will provide you with the same post-termination data retrieval assistance that we generally make available to all customers.</p>
        <p>(iiii) if the agreement was terminated by us, we will be refund subscription fees for the unused portion of the subscription period.</p>
        <p>Any additional post-termination assistance from us is subject to mutual agreement by you and us.</p>
        <h2 id="8-proprietary-rights">8. Proprietary Rights</h2>
        <h3 id="8-1-your-content-">8.1 Your Content.</h3>
        <p>As between you and us, you or your licensors own all right, title, and interest in and to Your Content. Except as provided in this Section 8, we obtain no rights under this Agreement from you or your licensors to Your Content, including any related
          intellectual property rights. You consent to our use of Your Content to provide the Service Offerings to you and any End Users. We may disclose Your Content to provide the Service Offerings to you or any End Users or to comply with any request
          of a governmental or regulatory body (including subpoenas or court orders).</p>
        <h3 id="8-2-adequate-rights-">8.2 Adequate Rights.</h3>
        <p>You represent and warrant to us that: (a) you or your licensors own all right, title, and interest in and to Your Content; (b) you have all rights in Your Content necessary to grant the rights contemplated by this Agreement</p>
        <h3 id="8-3-service-offerings-license-">8.3 Service Offerings License.</h3>
        <p>As between you and us, we or our affiliates or licensors own and reserve all right, title, and interest in and to the Service Offerings. We grant you a limited, revocable, non-exclusive, non-sublicensable, non-transferrable license to do the following
          during the Term: (i) access and use the Services solely in accordance with this Agreement; and (ii) copy and use the Deepiks Content solely in connection with your permitted use of the Services. Except as provided in this Section 8.4, you obtain
          no rights under this Agreement from us or our licensors to the Service Offerings, including any related intellectual property rights. Some Deepiks Content may be provided to you under a separate license, such as the Apache Software License
          or other open source license. In the event of a conflict between this Agreement and any separate license, the separate license will prevail with respect to that Deepiks Content.</p>
        <h3 id="8-4-license-restrictions-">8.4 License Restrictions.</h3>
        <p>Neither you nor any End User may use the Service Offerings in any manner or for any purpose other than as expressly permitted by this Agreement. Neither you nor any End User may, or may attempt to, (a) modify, alter, tamper with, repair, or otherwise
          create derivative works of any software included in the Service Offerings (except to the extent software included in the Service Offerings are provided to you under a separate license that expressly permits the creation of derivative works),
          (b) reverse engineer, disassemble, or decompile the Service Offerings or apply any other process or procedure to derive the source code of any software included in the Service Offerings, (c) access or use the Service Offerings in a way intended
          to avoid incurring fees or exceeding usage limits or quotas, or (d) resell or sublicense the Service Offerings. All licenses granted to you in this Agreement are conditional on your continued compliance this Agreement, and will immediately and
          automatically terminate if you do not comply with any term or condition of this Agreement. During and after the Term, you will not assert, nor will you authorize, assist, or encourage any third party to assert, against us or any of our affiliates,
          customers, vendors, business partners, or licensors, any patent infringement or other intellectual property infringement claim regarding any Service Offerings you have used.</p>
        <h2 id="9-indemnification-">9. Indemnification.</h2>
        <h3 id="9-1-general-">9.1. General.</h3>
        <p>You will defend, indemnify, and hold harmless us, our affiliates and licensors, and each of their respective employees, officers, directors, and representatives from and against any claims, damages, losses, liabilities, costs, and expenses (including
          reasonable attorneys’ fees) arising out of or relating to any third party claim concerning: (a) your or any End Users’ use of the Service Offerings (including any activities under your Deepiks account and use by your employees and personnel);
          (b) breach of this Agreement or violation of applicable law by you or any End User; (c) Your Content or the combination of Your Content with other applications, content or processes, including any claim involving alleged infringement or misappropriation
          of third-party rights by Your Content or by the use, development, design, production, advertising or marketing of Your Content; or (d) a dispute between you and any End User. If we or our affiliates are obligated to respond to a third party
          subpoena or other compulsory legal order or process described above, you will also reimburse us for reasonable attorneys’ fees, as well as our employees’ and contractors’ time and materials spent responding to the third party subpoena or other
          compulsory legal order or process at our then-current hourly rates.</p>
        <h3 id="9-2-process-">9.2. Process.</h3>
        <p>We will promptly notify you of any claim subject to Section 9.1, but our failure to promptly notify you will only affect your obligations under Section 9.1 to the extent that our failure prejudices your ability to defend the claim. You may: (a)
          use counsel of your own choosing (subject to our written consent) to defend against any claim; and (b) settle the claim as you deem appropriate, provided that you obtain our prior written consent before entering into any settlement. We may also
          assume control of the defense and settlement of the claim at any time.</p>
        <h2 id="10-disclaimers-">10. Disclaimers.</h2>
        <p>THE SERVICE OFFERINGS ARE PROVIDED “AS IS.” WE AND OUR AFFILIATES AND LICENSORS MAKE NO REPRESENTATIONS OR WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY OR OTHERWISE REGARDING THE SERVICE OFFERINGS OR THE THIRD PARTY CONTENT, INCLUDING
          ANY WARRANTY THAT THE SERVICE OFFERINGS OR THIRD PARTY CONTENT WILL BE UNINTERRUPTED, ERROR FREE OR FREE OF HARMFUL COMPONENTS, OR THAT ANY CONTENT, INCLUDING YOUR CONTENT OR THE THIRD PARTY CONTENT, WILL BE SECURE OR NOT OTHERWISE LOST OR DAMAGED.
          EXCEPT TO THE EXTENT PROHIBITED BY LAW, WE AND OUR AFFILIATES AND LICENSORS DISCLAIM ALL WARRANTIES, INCLUDING ANY IMPLIED WARRANTIES OF MERCHANTABILITY, SATISFACTORY QUALITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR QUIET ENJOYMENT,
          AND ANY WARRANTIES ARISING OUT OF ANY COURSE OF DEALING OR USAGE OF TRADE.</p>
        <h2 id="11-limitations-of-liability-">11. Limitations of Liability.</h2>
        <p>WE AND OUR AFFILIATES OR LICENSORS WILL NOT BE LIABLE TO YOU FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR EXEMPLARY DAMAGES (INCLUDING DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, OR DATA), EVEN IF A PARTY HAS BEEN ADVISED OF
          THE POSSIBILITY OF SUCH DAMAGES. FURTHER, NEITHER WE NOR ANY OF OUR AFFILIATES OR LICENSORS WILL BE RESPONSIBLE FOR ANY COMPENSATION, REIMBURSEMENT, OR DAMAGES ARISING IN CONNECTION WITH: (A) YOUR INABILITY TO USE THE SERVICES, INCLUDING AS
          A RESULT OF ANY (I) TERMINATION OR SUSPENSION OF THIS AGREEMENT OR YOUR USE OF OR ACCESS TO THE SERVICE OFFERINGS, (II) OUR DISCONTINUATION OF ANY OR ALL OF THE SERVICE OFFERINGS, OR, (III) WITHOUT LIMITING ANY OBLIGATIONS UNDER THE SLAS, ANY
          UNANTICIPATED OR UNSCHEDULED DOWNTIME OF ALL OR A PORTION OF THE SERVICES FOR ANY REASON, INCLUDING AS A RESULT OF POWER OUTAGES, SYSTEM FAILURES OR OTHER INTERRUPTIONS; (B) THE COST OF PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; (c) ANY INVESTMENTS,
          EXPENDITURES, OR COMMITMENTS BY YOU IN CONNECTION WITH THIS AGREEMENT OR YOUR USE OF OR ACCESS TO THE SERVICE OFFERINGS; OR (D) ANY UNAUTHORIZED ACCESS TO, ALTERATION OF, OR THE DELETION, DESTRUCTION, DAMAGE, LOSS OR FAILURE TO STORE ANY OF
          YOUR CONTENT OR OTHER DATA. IN ANY CASE, OUR AND OUR AFFILIATES’ AND LICENSORS’ AGGREGATE LIABILITY UNDER THIS AGREEMENT WILL BE LIMITED TO THE AMOUNT YOU ACTUALLY PAY US UNDER THIS AGREEMENT FOR THE SERVICE THAT GAVE RISE TO THE CLAIM DURING
          THE 12 MONTHS PRECEDING THE CLAIM.</p>
        <h2 id="12-modifications-to-the-agreement-">12. Modifications to the Agreement.</h2>
        <p>We may modify this Agreement (including any Policies) at any time by posting a revised version on the Deepiks Site or by otherwise notifying you in accordance with Section 13.7. The modified terms will become effective upon posting or, if we
          notify you by email, as stated in the email message. By continuing to use the Service Offerings after the effective date of any modifications to this Agreement, you agree to be bound by the modified terms. It is your responsibility to check
          the Deepiks Site regularly for modifications to this Agreement. We last modified this Agreement on the date listed at the beginning of this Agreement.</p>
        <h2 id="13-miscellaneous-">13. Miscellaneous.</h2>
        <p>13.1 Confidentiality and Publicity.</p>
        <p>You may use Deepiks Confidential information only in connection with your use of the Service Offerings as permitted under this Agreement. You will not disclose Deepiks Confidential Information during the Term or at any time during the 5 year
          period following the end of the Term. You will take all reasonable measures to avoid disclosure, dissemination or unauthorized use of Deepiks Confidential Information, including, at a minimum, those measures you take to protect your own confidential
          information of a similar nature. You will not issue any press release or make any other public communication with respect to this Agreement or your use of the Service Offerings. You will not misrepresent or embellish the relationship between
          us and you (including by expressing or implying that we support, sponsor, endorse, or contribute to you or your business endeavors), or express or imply any relationship or affiliation between us and you or any other person or entity except
          as expressly permitted by this Agreement.</p>
        <h3 id="13-2-force-majeure-">13.2 Force Majeure.</h3>
        <p>We and our affiliates will not be liable for any delay or failure to perform any obligation under this Agreement where the delay or failure results from any cause beyond our reasonable control, including acts of God, labor disputes or other industrial
          disturbances, systemic electrical, telecommunications, or other utility failures, earthquake, storms or other elements of nature, blockages, embargoes, riots, acts or orders of government, acts of terrorism, or war.</p>
        <h3 id="13-3-independent-contractors-non-exclusive-rights-">13.3 Independent Contractors; Non-Exclusive Rights.</h3>
        <p>We and you are independent contractors, and neither party, nor any of their respective affiliates, is an agent of the other for any purpose or has the authority to bind the other. Both parties reserve the right (a) to develop or have developed
          for it products, services, concepts, systems, or techniques that are similar to or compete with the products, services, concepts, systems, or techniques developed or contemplated by the other party and (b) to assist third party developers or
          systems integrators who may offer products or services which compete with the other party’s products or services.</p>
        <h3 id="13-4-no-third-party-beneficiaries-">13.4 No Third Party Beneficiaries.</h3>
        <p>This Agreement does not create any third party beneficiary rights in any individual or entity that is not a party to this Agreement.</p>
        <h3 id="13-5-notice-">13.5 Notice.</h3>
        <p>(a) To You. We may provide any notice to you under this Agreement by: (i) posting a notice on the Deepiks Site; or (ii) sending a message to the email address then associated with your account. Notices we provide by posting on the Deepiks Site
          will be effective upon posting and notices we provide by email will be effective when we send the email. It is your responsibility to keep your email address current. You will be deemed to have received any email sent to the email address then
          associated with your account when we send the email, whether or not you actually receive the email.</p>
        <p>(b) To Us. To give us notice under this Agreement, you must contact Deepiks as follows: (i) by facsimile transmission to +33 1 72 74 33 84; or (ii) by personal delivery, overnight courier or registered or certified mail to Deepiks SAS - 24,
          rue du Centre - 74350 Annecy- France. We may update the facsimile number or address for notices to us by posting a notice on the Deepiks Site. Notices provided by personal delivery will be effective immediately. Notices provided by facsimile
          transmission or overnight courier will be effective one business day after they are sent. Notices provided registered or certified mail will be effective three business days after they are sent.</p>
        <p>(c) Language. All communications and notices to be made or given pursuant to this Agreement must be in the English language.</p>
        <h3 id="13-6-assignment-">13.6 Assignment.</h3>
        <p>You will not assign this Agreement, or delegate or sublicense any of your rights under this Agreement, without our prior written consent. Any assignment or transfer in violation of this Section 13.8 will be void. Subject to the foregoing, this
          Agreement will be binding upon, and inure to the benefit of the parties and their respective successors and assigns.</p>
        <h3 id="13-7-no-waivers-">13.7 No Waivers.</h3>
        <p>The failure by us to enforce any provision of this Agreement will not constitute a present or future waiver of such provision nor limit our right to enforce such provision at a later time. All waivers by us must be in writing to be effective.</p>
        <h3 id="13-8-severability-">13.8 Severability.</h3>
        <p>If any portion of this Agreement is held to be invalid or unenforceable, the remaining portions of this Agreement will remain in full force and effect. Any invalid or unenforceable portions will be interpreted to effect and intent of the original
          portion. If such construction is not possible, the invalid or unenforceable portion will be severed from this Agreement but the rest of the Agreement will remain in full force and effect.</p>
        <h3 id="13-9-governing-law-venue-">13.9 Governing Law; Venue.</h3>
        <p>The laws of France, without reference to conflict of law rules, govern this Agreement and any dispute of any sort that might arise between you and us. Any dispute relating in any way to the Service Offerings or this Agreement will be adjudicated
          in the court of Annecy, France.</p>
        <h3 id="13-12-entire-agreement-english-language-">13.12 Entire Agreement; English Language.</h3>
        <p>This Agreement includes the Policies and is the entire agreement between you and us regarding the subject matter of this Agreement. This Agreement supersedes all prior or contemporaneous representations, understandings, agreements, or communications
          between you and us, whether written or verbal, regarding the subject matter of this Agreement. Notwithstanding any other agreement between you and us, the security and data privacy provisions in Section 3 of this Agreement contain our and our
          affiliates’ entire obligation regarding the security, privacy and confidentiality of Your Content. We will not be bound by, and specifically object to, any term, condition or other provision which is different from or in addition to the provisions
          of this Agreement (whether or not it would materially alter this Agreement) and which is submitted by you in any order, receipt, acceptance, confirmation, correspondence or other document. If the terms of this document are inconsistent with
          the terms contained in any Policy, the terms contained in this document will control, except that the Service Terms will control over this document. If we provide a translation of the English language version of this Agreement, the English language
          version of the Agreement will control if there is any conflict.</p>
        <h2 id="14-definitions-">14. Definitions.</h2>
        <p>“Deepiks Confidential Information” means all nonpublic information disclosed by us, our affiliates, business partners or our or their respective employees, contractors or agents that is designated as confidential or that, given the nature of
          the information or circumstances surrounding its disclosure, reasonably should be understood to be confidential. Deepiks Confidential Information includes: (a) nonpublic information relating to our or our affiliates or business partners’ technology,
          customers, business plans, promotional and marketing activities, finances and other business affairs; (b) third-party information that we are obligated to keep confidential; and (c) the nature, content and existence of any discussions or negotiations
          between you and us or our affiliates. Deepiks Confidential Information does not include any information that: (i) is or becomes publicly available without breach of this Agreement; (ii) can be shown by documentation to have been known to you
          at the time of your receipt from us; (iii) is received from a third party who did not acquire or disclose the same by a wrongful or tortious act; or (iv) can be shown by documentation to have been independently developed by you without reference
          to the Deepiks Confidential Information.</p>
        <p>“Deepiks Content” means Content we or any of its affiliates make available in connection with the Services or on the Deepiks Site to allow access to and use of the Services, including Documentation; sample code; software libraries; command line
          tools; and other related technology. Deepiks Content does not include the Services.</p>
        <p>“Deepiks Marks” means any trademarks, service marks, service or trade names, logos, and other designations of Deepiks and its affiliates that we may make available to you in connection with this Agreement.</p>
        <p>“Deepiks Site” means www.Deepiks.com and any successor or related site designated by us.</p>
        <p>“Content” means software , data, text, audio, video, images or other content.</p>
        <p>“Documentation” means technical and operations manuals and specifications for the Services.</p>
        <p>“End User” means any individual or entity that directly or indirectly through another user: (a) accesses or uses Your Content; or (b) otherwise accesses or uses the Service Offerings under your account.</p>
        <p>“Policies” means all restrictions described in the Deepiks Content and on the Deepiks Site, and any other policy or terms referenced in or incorporated into this Agreement.</p>
        <p>“Service” means each of the web services made available by us or our affiliates, including those web services described in the Service Terms.</p>
        <p>“Service Level Agreement” means all service level agreements that we offer with respect to the Services and post on the Deepiks Site, as they may be updated by us from time to time.</p>
        <p>“Service Offerings” means the Services, the Deepiks Content, the Deepiks Marks, the Deepiks Site, and any other product or service provided by us under this Agreement. Service Offerings do not include Third Party Content.</p>
        <p>“Service Terms” means the rights and restrictions for particular services.</p>
        <p>“Term” means the term of this Agreement described in Section 7.1.</p>
        <p>“Third Party Content” means Content made available to you by any third party on the Deepiks Site or in conjunction with the Services.</p>
        <p>“Your Content” means Content you or any End User (a) run on the Services, (b) cause to interface with the Services, or (c) upload to the Services under your account or otherwise transfer, process, use or store in connection with your account.</p>


                </div>
            </div>
        );
    }
});




export default TermsOfUsePage;